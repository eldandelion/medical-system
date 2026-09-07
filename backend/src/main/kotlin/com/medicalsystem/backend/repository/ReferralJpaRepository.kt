package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.ReferralEntity
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository

@Repository
interface ReferralJpaRepository : JpaRepository<ReferralEntity, Long>, JpaSpecificationExecutor<ReferralEntity> {

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = ["steps", "attachments"])
    override fun findAll(): List<ReferralEntity>

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = ["steps", "attachments"])
    override fun findAll(spec: Specification<ReferralEntity>): List<ReferralEntity>

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = ["steps", "attachments"])
    override fun findById(id: Long): java.util.Optional<ReferralEntity>

    fun countByDestinationHospitalId(hospitalId: Long): Long
    fun countByDestinationDepartmentId(departmentId: Long): Long
}
