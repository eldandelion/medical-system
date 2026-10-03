package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.AssessmentSearchResultDto
import com.medicalsystem.backend.dto.ReferralSearchResultDto
import com.medicalsystem.backend.dto.SearchResultDto
import com.medicalsystem.backend.dto.StudentSearchResultDto
import com.medicalsystem.backend.model.AssessmentScaleRepository
import com.medicalsystem.backend.model.ReferralVisibilityPolicy
import com.medicalsystem.backend.model.StudentVisibilityPolicy
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.*
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class SearchService(
    private val studentJpaRepository: StudentJpaRepository,
    private val referralJpaRepository: ReferralJpaRepository,
    private val assessmentAssignmentJpaRepository: AssessmentAssignmentJpaRepository,
    private val scaleRepository: AssessmentScaleRepository,
    private val userJpaRepository: UserJpaRepository
) {

    fun globalSearch(query: String, user: User, limit: Int = 10): SearchResultDto {
        val trimmed = query.trim()
        if (trimmed.isEmpty()) {
            return SearchResultDto(query = "")
        }

        val clampedLimit = limit.coerceIn(1, 20)
        val pageable = PageRequest.of(0, clampedLimit)

        // 1. Adaptive Student Search with DB-level pagination
        val studentCriteria = StudentVisibilityPolicy.getVisibilityCriteria(user)
        val studentSpec = SearchSpecifications.studentSearch(studentCriteria, trimmed)
        val pagedStudents = studentJpaRepository.findAll(studentSpec, pageable).content
        val students = pagedStudents.map { entity ->
            // Clinical risk evaluations are kept null on student search summaries to prevent self-labeling/leakage
            StudentSearchResultDto(
                id = entity.id,
                studentNumber = entity.studentNumber,
                name = entity.name,
                majorName = entity.major.name,
                collegeName = entity.major.college?.name,
                enrollmentDate = entity.enrollmentDate,
                riskLevel = null
            )
        }

        // 2. Adaptive Referral Search with DB-level pagination
        val referralCriteria = ReferralVisibilityPolicy.getVisibilityCriteria(user)
        val referralSpec = SearchSpecifications.referralSearch(referralCriteria, trimmed)
        val pagedReferrals = referralJpaRepository.findAll(referralSpec, pageable).content

        // Batch load student names and doctor names
        val studentIds = pagedReferrals.map { it.studentId }.toSet()
        val studentMap = if (studentIds.isNotEmpty()) {
            studentJpaRepository.findAllById(studentIds).associateBy { it.id }
        } else emptyMap()

        val doctorUserIds = pagedReferrals.mapNotNull { it.destination?.doctor?.userId }.toSet()
        val doctorUserMap = if (doctorUserIds.isNotEmpty()) {
            userJpaRepository.findAllById(doctorUserIds).associateBy { it.id }
        } else emptyMap()

        val referrals = pagedReferrals.map { entity ->
            val isStudentRole = user.role == UserRole.STUDENT
            val student = studentMap[entity.studentId]
            val docUserId = entity.destination?.doctor?.userId
            val doctorUser = if (docUserId != null) doctorUserMap[docUserId] else null

            ReferralSearchResultDto(
                id = entity.id.toString(),
                studentId = entity.studentId,
                studentName = student?.name,
                studentNumber = student?.studentNumber,
                title = entity.title,
                descriptionSnippet = entity.description.take(120),
                status = entity.status,
                type = entity.type,
                createdAt = entity.createdAt,
                destinationHospitalName = entity.destination?.hospital?.name,
                destinationDoctorName = doctorUser?.name,
                riskLevel = if (isStudentRole) null else entity.riskLevel
            )
        }

        // 3. Adaptive Assessment Search
        val assessments = searchAssessments(trimmed, user, clampedLimit)

        return SearchResultDto(
            query = trimmed,
            students = students,
            referrals = referrals,
            assessments = assessments
        )
    }

    private fun searchAssessments(query: String, user: User, limit: Int): List<AssessmentSearchResultDto> {
        val allScales = scaleRepository.findAll()
        val scaleMap = allScales.associateBy { it.batteryCode }

        if (user.role == UserRole.STUDENT) {
            // Students only see their own assignments (metadata only, no clinical diagnostic scores)
            val assignments = assessmentAssignmentJpaRepository.findByStudentId(user.id)
            return assignments.filter { assignment ->
                val scale = scaleMap[assignment.batteryCode]
                val titleMatch = scale?.title?.contains(query, ignoreCase = true) == true
                val codeMatch = assignment.batteryCode.contains(query, ignoreCase = true)
                titleMatch || codeMatch
            }.take(limit).map { assignment ->
                val scale = scaleMap[assignment.batteryCode]
                AssessmentSearchResultDto(
                    id = assignment.id.toString(),
                    resultType = "ASSIGNMENT",
                    batteryCode = assignment.batteryCode,
                    title = scale?.title ?: assignment.batteryCode,
                    subtitle = scale?.subtitle,
                    status = assignment.status.name,
                    assignedByName = assignment.assignedByUser.name,
                    dueDate = assignment.dueDate,
                    duration = scale?.duration
                )
            }
        }

        // For Staff / Faculty / Clinicians: Scale Catalog search
        return allScales.filter { scale ->
            scale.title.contains(query, ignoreCase = true) ||
            scale.batteryCode.contains(query, ignoreCase = true) ||
            scale.subtitle?.contains(query, ignoreCase = true) == true
        }.take(limit).map { scale ->
            AssessmentSearchResultDto(
                id = scale.batteryCode,
                resultType = "CATALOG",
                batteryCode = scale.batteryCode,
                title = scale.title,
                subtitle = scale.subtitle,
                status = null,
                assignedByName = null,
                dueDate = null,
                duration = scale.duration
            )
        }
    }
}
