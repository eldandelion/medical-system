package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.ReferralFeedbackEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface ReferralFeedbackJpaRepository : JpaRepository<ReferralFeedbackEntity, Long> {
    fun findByReferralId(referralId: Long): Optional<ReferralFeedbackEntity>
}
