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

    private fun resolveUser(token: String?): com.medicalsystem.backend.model.User? {
        if (token == null) return null
        return if (token.contains("teacher_token_zhang")) {
            userRepository.findByName("艾米丽·沃森")
        } else if (token.contains("head_councillor")) {
            userRepository.findAll().firstOrNull { it.role == com.medicalsystem.backend.model.UserRole.HEAD_COUNSELLOR } 
                ?: com.medicalsystem.backend.model.HeadCounsellor(id = 999L, name = "Mock Head Councillor", email = "head@univ.edu.cn")
        } else if (token.contains("trial_admin")) {
            userRepository.findAll().firstOrNull { it.role == com.medicalsystem.backend.model.UserRole.TRIAL_ADMIN }
                ?: com.medicalsystem.backend.model.TrialAdmin(id = 998L, name = "Mock Trial Admin", email = "admin@univ.edu.cn")
        } else if (token.contains("doctor")) {
            userRepository.findAll().firstOrNull { it.role == com.medicalsystem.backend.model.UserRole.DOCTOR }
                ?: com.medicalsystem.backend.model.Doctor(id = 997L, name = "Mock Doctor", email = "doctor@univ.edu.cn", departmentId = 1L, phone = null)
        } else {
            userRepository.findAll().firstOrNull()
        }
    }

    fun fetchActiveReferrals(token: String? = null): List<ReferralDto> {
        val user = resolveUser(token)
        val referrals = if (user != null) {
            referralRepository.findVisibleReferralsFor(user)
        } else {
            referralRepository.findAll()
        }
        return referrals.map { referralMapper.toDto(it, user) }
    }

    fun fetchReferralDetails(id: Long, token: String? = null): com.medicalsystem.backend.dto.ReferralDetailsDto {
        val model = referralRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Referral with ID $id not found") }
        val user = resolveUser(token)
        return referralMapper.toDetailsDto(model, user)
    }

    fun fetchReferralTracking(id: Long): ReferralTrackingDto {
        val model = referralRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Referral with ID $id not found") }
        
        return referralMapper.toTrackingDto(model)
    }

    @Transactional
    fun initiateReferral(dto: com.medicalsystem.backend.dto.CreateReferralDto, token: String? = null): ReferralDto {
        val student = studentRepository.findById(dto.studentId)
            .orElseThrow { com.medicalsystem.backend.exception.StudentNotFoundException(dto.studentId) }
            
        val user = resolveUser(token) ?: throw ValidationException("Authorized user not found")
            
        val model = com.medicalsystem.backend.model.ReferralFactory.initiate(
            studentId = dto.studentId,
            title = dto.title,
            reason = dto.reason,
            riskLevel = dto.riskLevel,
            referredById = user.id,
            clinicalStatus = dto.clinicalStatus,
            severeRiskFactors = dto.severeRiskFactors,
            isDraft = dto.actionType == "draft"
        )

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
    fun approveReferral(id: Long, token: String? = null): ReferralDto {
        val user = resolveUser(token) ?: throw ValidationException("Authorized user not found")
        val referral = referralRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Referral with ID $id not found") }

        if (!referral.getAllowedActions(user).contains(com.medicalsystem.backend.model.ReferralAction.APPROVE_REFERRAL)) {
            throw ValidationException("User not authorized to approve referral")
        }

        referral.transition(ReferralStatus.AWAITING_TRIAGE, actorId = user.id)
        val saved = referralRepository.save(referral)
        
        saved.getDomainEvents().forEach { eventPublisher.publish(it) }
        saved.clearDomainEvents()

        return referralMapper.toDto(saved)
    }

    @Transactional
    fun rejectReferral(id: Long, dto: com.medicalsystem.backend.dto.RejectReferralDto, token: String? = null): ReferralDto {
        val user = resolveUser(token) ?: throw ValidationException("Authorized user not found")
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
    fun requestReassignment(id: Long, dto: com.medicalsystem.backend.dto.RejectReferralDto, token: String? = null): ReferralDto {
        val user = resolveUser(token) ?: throw ValidationException("Authorized user not found")
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
}
