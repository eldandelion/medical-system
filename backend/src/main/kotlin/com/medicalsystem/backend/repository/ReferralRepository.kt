package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.Referral
import com.medicalsystem.backend.model.User
import java.util.Optional

interface ReferralRepository {
    fun findAll(): List<Referral>
    fun findVisibleReferralsFor(user: User): List<Referral>
    fun findById(id: Long): Optional<Referral>
    fun save(referral: Referral): Referral
    fun deleteAll()
}
