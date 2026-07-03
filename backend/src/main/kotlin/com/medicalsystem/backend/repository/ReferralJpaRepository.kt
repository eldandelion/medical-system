package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.ReferralEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ReferralJpaRepository : JpaRepository<ReferralEntity, Long> {

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = ["steps", "attachments"])
    override fun findAll(): List<ReferralEntity>

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = ["steps", "attachments"])
    override fun findById(id: Long): java.util.Optional<ReferralEntity>
}
