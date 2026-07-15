package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.CreateReferralDto
import com.medicalsystem.backend.dto.ReferralDto
import com.medicalsystem.backend.dto.ReferralTrackingDto
import com.medicalsystem.backend.model.Referral
import com.medicalsystem.backend.model.ReferralStatus
import com.medicalsystem.backend.mapper.ReferralMapper
import com.medicalsystem.backend.repository.ReferralRepository
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.exception.ResourceNotFoundException
import com.medicalsystem.backend.model.ReferralType
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import org.slf4j.LoggerFactory
import com.medicalsystem.backend.repository.UserRepository
import com.medicalsystem.backend.exception.ValidationException
import com.medicalsystem.backend.model.User

@Service
@Transactional(readOnly = true)
class ReferralService(
    private val referralRepository: ReferralRepository,
    private val studentRepository: StudentRepository,
    private val userRepository: UserRepository,
    private val referralMapper: ReferralMapper,
    private val eventPublisher: com.medicalsystem.backend.event.DomainEventPublisher
) {
    private val logger = LoggerFactory.getLogger(ReferralService::class.java)

    companion object {
        const val ACTION_DRAFT = "draft"
    }

    fun fetchActiveReferrals(user: User? = null): List<ReferralDto> {
        val referrals = if (user != null) {
            referralRepository.findVisibleReferralsFor(user)
        } else {
            referralRepository.findAll()
        }
        return referrals.map { referralMapper.toDto(it, user) }
    }

    fun fetchReferralDetails(id: Long, user: User? = null): com.medicalsystem.backend.dto.ReferralDetailsDto {
        val model = referralRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Referral with ID $id not found") }
        return referralMapper.toDetailsDto(model, user)
    }

    fun fetchReferralTracking(id: Long): ReferralTrackingDto {
        val model = referralRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Referral with ID $id not found") }
        
        return referralMapper.toTrackingDto(model)
    }

    @Transactional
    fun initiateReferral(dto: com.medicalsystem.backend.dto.CreateReferralDto, user: User): ReferralDto {
        val student = studentRepository.findById(dto.studentId)
            .orElseThrow { com.medicalsystem.backend.exception.StudentNotFoundException(dto.studentId) }
            
        val model = com.medicalsystem.backend.model.ReferralFactory.createDraft(
            studentId = dto.studentId,
            title = dto.title,
            reason = dto.reason,
            riskLevel = dto.riskLevel,
            referredById = user.id,
            clinicalStatus = dto.clinicalStatus,
            severeRiskFactors = dto.severeRiskFactors
        )

        if (dto.actionType != ACTION_DRAFT) {
            model.submit(user.role, user.id)
        }

        val saved = referralRepository.save(model)
        
        eventPublisher.publish(
            com.medicalsystem.backend.event.ReferralInitiatedEvent(
                referralId = saved.id!!,
                studentId = saved.studentId,
                riskLevel = saved.riskLevel.name
            )
        )
        saved.getDomainEvents().forEach { eventPublisher.publish(it) }
        saved.clearDomainEvents()
        
        return referralMapper.toDto(saved)
    }

    @Transactional
    fun approveReferral(id: Long, dto: com.medicalsystem.backend.dto.ApproveReferralDto, user: User): ReferralDto {
        val referral = referralRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Referral with ID $id not found") }

        if (!referral.getAllowedActions(user).contains(com.medicalsystem.backend.model.ReferralAction.APPROVE_REFERRAL)) {
            throw ValidationException("User not authorized to approve referral")
        }
        
        val trialAdmins = userRepository.findAll().filterIsInstance<com.medicalsystem.backend.model.TrialAdmin>()
        val hasTrialAdmin = trialAdmins.any { it.hospitalId == dto.hospitalId }
        
        if (!hasTrialAdmin) {
            throw ValidationException("Selected hospital has no assigned Trial Admin")
        }

        referral.destination = com.medicalsystem.backend.model.ReferralDestination.Submitted(
            hospitalId = com.medicalsystem.backend.model.HospitalId(dto.hospitalId),
            transferDate = null
        )

        referral.transition(ReferralStatus.AWAITING_TRIAGE, actorId = user.id)
        val saved = referralRepository.save(referral)
        
        saved.getDomainEvents().forEach { eventPublisher.publish(it) }
        saved.clearDomainEvents()

        return referralMapper.toDto(saved)
    }

    @Transactional
    fun rejectReferral(id: Long, dto: com.medicalsystem.backend.dto.RejectReferralDto, user: User): ReferralDto {
        val referral = referralRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Referral with ID $id not found") }

        if (!referral.getAllowedActions(user).contains(com.medicalsystem.backend.model.ReferralAction.REJECT_REFERRAL)) {
            throw ValidationException("User not authorized to reject referral")
        }

        referral.transition(ReferralStatus.REJECTED, actorId = user.id, reason = dto.reason)
        val saved = referralRepository.save(referral)
        
        saved.getDomainEvents().forEach { eventPublisher.publish(it) }
        saved.clearDomainEvents()

        return referralMapper.toDto(saved)
    }
    
    @Transactional
    fun assignDoctor(id: Long, dto: com.medicalsystem.backend.dto.AssignDoctorDto, user: User): ReferralDto {
        val referral = referralRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Referral with ID $id not found") }

        if (!referral.getAllowedActions(user).contains(com.medicalsystem.backend.model.ReferralAction.ASSIGN_DOCTOR) &&
            !referral.getAllowedActions(user).contains(com.medicalsystem.backend.model.ReferralAction.REASSIGN_DOCTOR)) {
            throw ValidationException("User not authorized to assign doctor")
        }

        val doctor = userRepository.findById(dto.doctorId)
            .orElseThrow { ResourceNotFoundException("Doctor with ID ${dto.doctorId} not found") }
        
        if (doctor.role != com.medicalsystem.backend.model.UserRole.DOCTOR) {
            throw ValidationException("Assigned user is not a doctor")
        }

        val existingHospitalId = (referral.destination as? com.medicalsystem.backend.model.ReferralDestination.Submitted)?.hospitalId 
            ?: (referral.destination as? com.medicalsystem.backend.model.ReferralDestination.Triaged)?.hospitalId
            ?: throw ValidationException("Hospital must be assigned before assigning a doctor")

        val departmentIdRaw = (doctor as? com.medicalsystem.backend.model.Doctor)?.departmentId
            ?: throw ValidationException("Assigned doctor has no department")

        referral.destination = com.medicalsystem.backend.model.ReferralDestination.Triaged(
            hospitalId = existingHospitalId,
            triageAdminId = com.medicalsystem.backend.model.TriageAdminId(user.id),
            departmentId = com.medicalsystem.backend.model.DepartmentId(departmentIdRaw),
            doctorId = com.medicalsystem.backend.model.DoctorId(doctor.id),
            transferDate = referral.destination?.transferDate
        )

        referral.transition(ReferralStatus.WAITING_FOR_SCHEDULING, actorId = user.id)
        val saved = referralRepository.save(referral)
        
        saved.getDomainEvents().forEach { eventPublisher.publish(it) }
        saved.clearDomainEvents()

        return referralMapper.toDto(saved)
    }

    @Transactional
    fun requestReassignment(id: Long, dto: com.medicalsystem.backend.dto.RejectReferralDto, user: User): ReferralDto {
        val referral = referralRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Referral with ID $id not found") }

        if (!referral.getAllowedActions(user).contains(com.medicalsystem.backend.model.ReferralAction.REQUEST_REASSIGNMENT)) {
            throw ValidationException("User not authorized to request reassignment")
        }

        referral.transition(ReferralStatus.NEEDS_REASSIGNMENT, actorId = user.id, reason = dto.reason)
        val saved = referralRepository.save(referral)
        
        saved.getDomainEvents().forEach { eventPublisher.publish(it) }
        saved.clearDomainEvents()

        return referralMapper.toDto(saved)
    }

    @Transactional
    fun scheduleAppointment(id: Long, dto: com.medicalsystem.backend.dto.ScheduleAppointmentDto, user: User): ReferralDto {
        val referral = referralRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Referral with ID $id not found") }

        if (!referral.getAllowedActions(user).contains(com.medicalsystem.backend.model.ReferralAction.SCHEDULE_APPOINTMENT)) {
            throw ValidationException("User not authorized to schedule appointment")
        }

        if (user.role != com.medicalsystem.backend.model.UserRole.DOCTOR) {
            throw ValidationException("Only doctors can schedule appointments")
        }

        val time = dto.appointmentTime ?: throw ValidationException("Appointment time is required")

        referral.scheduleAppointment(doctorId = user.id, time = time, actorId = user.id)
        
        val saved = referralRepository.save(referral)
        
        saved.getDomainEvents().forEach { eventPublisher.publish(it) }
        saved.clearDomainEvents()

        return referralMapper.toDto(saved)
    }
}
