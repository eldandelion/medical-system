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
    private val referralMapper: ReferralMapper
) {
    private val logger = LoggerFactory.getLogger(ReferralService::class.java)

    companion object {
        const val ACTION_DRAFT = "draft"
    }

    fun getAllReferrals(): List<ReferralDto> {
        return referralRepository.findAll()
            .map { referralMapper.toDto(it) }
    }

    fun getReferralById(id: Long): ReferralDto {
        val model = referralRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Referral with ID $id not found") }
        return referralMapper.toDto(model)
    }

    fun getReferralTracking(id: Long): ReferralTrackingDto {
        val model = referralRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Referral with ID $id not found") }
        
        return referralMapper.toTrackingDto(model)
    }

    @Transactional
    fun createReferral(dto: CreateReferralDto, token: String? = null): ReferralDto {
        val student = studentRepository.findById(dto.studentId)
            .orElseThrow { ResourceNotFoundException("Student with id ${dto.studentId} not found") }

        // In a real application, token parsing and identity resolution happens in a security filter.
        // Here we mock identity resolution.
        val user = if (token?.contains("teacher_token_zhang") == true) {
            userRepository.findByName("艾米丽·沃森") 
                ?: throw ValidationException("Authorized user not found in database")
        } else {
            userRepository.findAll().firstOrNull()
                ?: throw ValidationException("No user found in database for fallback")
        }

        val model = Referral(
            id = null,
            studentId = student.id,
            type = com.medicalsystem.backend.model.ReferralType.INITIAL,
            title = dto.title,
            description = dto.reason,
            riskLevel = dto.riskLevel,
            status = com.medicalsystem.backend.model.ReferralStatus.DRAFT,
            referredById = user.id,
            date = LocalDateTime.now(),
            clinicalStatus = dto.clinicalStatus.toMutableList(),
            severeRiskFactors = dto.severeRiskFactors.toMutableList()
        )

        dto.attachments.forEach { attachmentDto ->
            val attachment = com.medicalsystem.backend.model.Attachment(
                id = null,
                name = attachmentDto.name,
                size = attachmentDto.size
            )
            model.attachments.add(attachment)
        }

        if (dto.actionType != ACTION_DRAFT) {
            model.transition(
                newStatus = ReferralStatus.AWAITING_APPROVAL,
                title = "发起转诊",
                subtitle = "由辅导员提交",
                actorId = null
            )
        }

        val saved = referralRepository.save(model)
        return referralMapper.toDto(saved)
    }
}

