package com.medicalsystem.backend.event

import com.medicalsystem.backend.model.ReferenceDataStatus
import com.medicalsystem.backend.repository.HospitalDepartmentRepository
import com.medicalsystem.backend.repository.MajorJpaRepository
import com.medicalsystem.backend.repository.SchoolDepartmentJpaRepository
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class ReferenceDataCascadeListener(
    private val majorJpaRepository: MajorJpaRepository,
    private val hospitalDepartmentRepository: HospitalDepartmentRepository,
    private val schoolDepartmentJpaRepository: SchoolDepartmentJpaRepository
) {
    private val logger = LoggerFactory.getLogger(ReferenceDataCascadeListener::class.java)

    @EventListener
    @Transactional
    fun onCollegeStatusChanged(event: CollegeStatusChangedEvent) {
        if (event.newStatus == ReferenceDataStatus.DEPRECATED) {
            val childMajors = majorJpaRepository.findByCollegeIdAndStatus(event.collegeId, ReferenceDataStatus.ACTIVE)
            if (childMajors.isNotEmpty()) {
                logger.info("Cascading DEPRECATED status to ${childMajors.size} majors under college ${event.collegeId}")
                childMajors.forEach { it.status = ReferenceDataStatus.DEPRECATED }
                majorJpaRepository.saveAll(childMajors)
            }
        }
    }

    @EventListener
    @Transactional
    fun onHospitalStatusChanged(event: HospitalStatusChangedEvent) {
        if (event.newStatus == ReferenceDataStatus.DEPRECATED) {
            val childDepts = hospitalDepartmentRepository.findByHospitalIdAndStatus(event.hospitalId, ReferenceDataStatus.ACTIVE)
            if (childDepts.isNotEmpty()) {
                logger.info("Cascading DEPRECATED status to ${childDepts.size} departments under hospital ${event.hospitalId}")
                childDepts.forEach { it.status = ReferenceDataStatus.DEPRECATED }
                hospitalDepartmentRepository.saveAll(childDepts)
            }
        }
    }

    @EventListener
    @Transactional
    fun onSchoolStatusChanged(event: SchoolStatusChangedEvent) {
        if (event.newStatus == ReferenceDataStatus.DEPRECATED) {
            val childDepts = schoolDepartmentJpaRepository.findBySchoolIdAndStatus(event.schoolId, ReferenceDataStatus.ACTIVE)
            if (childDepts.isNotEmpty()) {
                logger.info("Cascading DEPRECATED status to ${childDepts.size} departments under school ${event.schoolId}")
                childDepts.forEach { it.status = ReferenceDataStatus.DEPRECATED }
                schoolDepartmentJpaRepository.saveAll(childDepts)
            }
        }
    }
}
