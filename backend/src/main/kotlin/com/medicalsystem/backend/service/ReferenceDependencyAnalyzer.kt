package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.ReferenceDependencyCheckDto
import com.medicalsystem.backend.dto.ReferenceDependencyItemDto
import com.medicalsystem.backend.model.ReferenceCategory
import com.medicalsystem.backend.model.ReferenceSubjectType
import com.medicalsystem.backend.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class ReferenceDependencyAnalyzer(
    private val majorJpaRepository: MajorJpaRepository,
    private val teacherJpaRepository: TeacherJpaRepository,
    private val studentJpaRepository: StudentJpaRepository,
    private val headCounsellorJpaRepository: HeadCounsellorJpaRepository,
    private val hospitalDepartmentRepository: HospitalDepartmentRepository,
    private val trialAdminJpaRepository: TrialAdminJpaRepository,
    private val referralJpaRepository: ReferralJpaRepository,
    private val doctorRepository: DoctorRepository,
    private val schoolDepartmentJpaRepository: SchoolDepartmentJpaRepository
) {

    fun checkDependencies(category: ReferenceCategory, id: Long): ReferenceDependencyCheckDto {
        val dependencies = mutableListOf<ReferenceDependencyItemDto>()

        when (category) {
            ReferenceCategory.COLLEGE -> {
                val majorCount = majorJpaRepository.countByCollegeId(id)
                if (majorCount > 0) {
                    dependencies.add(ReferenceDependencyItemDto(ReferenceSubjectType.MAJOR, majorCount))
                }
                val teacherCount = teacherJpaRepository.countByCollegeId(id)
                if (teacherCount > 0) {
                    dependencies.add(ReferenceDependencyItemDto(ReferenceSubjectType.TEACHER, teacherCount))
                }
            }

            ReferenceCategory.MAJOR -> {
                val studentCount = studentJpaRepository.countByMajorId(id)
                if (studentCount > 0) {
                    dependencies.add(ReferenceDependencyItemDto(ReferenceSubjectType.STUDENT, studentCount))
                }
            }

            ReferenceCategory.SCHOOL_DEPARTMENT -> {
                val staffCount = headCounsellorJpaRepository.countByDepartmentId(id)
                if (staffCount > 0) {
                    dependencies.add(ReferenceDependencyItemDto(ReferenceSubjectType.HEAD_COUNSELLOR, staffCount))
                }
            }

            ReferenceCategory.SCHOOL -> {
                val deptCount = schoolDepartmentJpaRepository.countBySchoolId(id)
                if (deptCount > 0) {
                    dependencies.add(ReferenceDependencyItemDto(ReferenceSubjectType.SCHOOL_DEPARTMENT, deptCount))
                }
                val studentCount = studentJpaRepository.countByDemographicsSchoolId(id)
                if (studentCount > 0) {
                    dependencies.add(ReferenceDependencyItemDto(ReferenceSubjectType.STUDENT, studentCount))
                }
            }

            ReferenceCategory.HOSPITAL -> {
                val deptCount = hospitalDepartmentRepository.countByHospitalId(id)
                if (deptCount > 0) {
                    dependencies.add(ReferenceDependencyItemDto(ReferenceSubjectType.HOSPITAL_DEPARTMENT, deptCount))
                }
                val adminCount = trialAdminJpaRepository.countByHospitalId(id)
                if (adminCount > 0) {
                    dependencies.add(ReferenceDependencyItemDto(ReferenceSubjectType.TRIAL_ADMIN, adminCount))
                }
                val refCount = referralJpaRepository.countByDestinationHospitalId(id)
                if (refCount > 0) {
                    dependencies.add(ReferenceDependencyItemDto(ReferenceSubjectType.REFERRAL, refCount))
                }
            }

            ReferenceCategory.HOSPITAL_DEPARTMENT -> {
                val docCount = doctorRepository.countByDepartmentId(id)
                if (docCount > 0) {
                    dependencies.add(ReferenceDependencyItemDto(ReferenceSubjectType.DOCTOR, docCount))
                }
                val refCount = referralJpaRepository.countByDestinationDepartmentId(id)
                if (refCount > 0) {
                    dependencies.add(ReferenceDependencyItemDto(ReferenceSubjectType.REFERRAL, refCount))
                }
            }

            ReferenceCategory.ETHNICITY -> {
                val studentCount = studentJpaRepository.countByDemographicsEthnicityId(id)
                if (studentCount > 0) {
                    dependencies.add(ReferenceDependencyItemDto(ReferenceSubjectType.STUDENT, studentCount))
                }
            }

            ReferenceCategory.DEGREE_LEVEL -> {
                val studentCount = studentJpaRepository.countByDegreeLevelId(id)
                if (studentCount > 0) {
                    dependencies.add(ReferenceDependencyItemDto(ReferenceSubjectType.STUDENT, studentCount))
                }
            }
        }

        val total = dependencies.sumOf { it.count }
        return ReferenceDependencyCheckDto(
            targetId = id,
            category = category,
            canHardDelete = (total == 0L),
            totalReferences = total,
            dependencies = dependencies
        )
    }
}
