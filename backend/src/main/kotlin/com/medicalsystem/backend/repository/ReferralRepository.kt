package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.ReferralEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ReferralRepository : JpaRepository<ReferralEntity, Long>
