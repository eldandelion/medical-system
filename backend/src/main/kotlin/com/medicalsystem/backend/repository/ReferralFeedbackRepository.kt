package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.ReferralFeedback
import java.util.Optional

interface ReferralFeedbackRepository {
    fun save(feedback: ReferralFeedback): ReferralFeedback
    fun findByReferralId(referralId: Long): Optional<ReferralFeedback>
}
