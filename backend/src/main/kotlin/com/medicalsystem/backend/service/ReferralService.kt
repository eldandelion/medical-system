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

    fun fetchActiveReferrals(token: String? = null): List<ReferralDto> {
        return referralRepository.findAll()
            .map { referralMapper.toDto(it) }
    }

    fun fetchReferralDetails(id: Long): ReferralDto {
        val model = referralRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Referral with ID $id not found") }
        return referralMapper.toDto(model)
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
            
        // Mock identity resolution
        val user = if (token?.contains("teacher_token_zhang") == true) {
            userRepository.findByName("艾米丽·沃森") 
                ?: throw ValidationException("Authorized user not found in database")
        } else {
            userRepository.findAll().firstOrNull()
                ?: throw ValidationException("No user found in database for fallback")
        }
            
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
}
