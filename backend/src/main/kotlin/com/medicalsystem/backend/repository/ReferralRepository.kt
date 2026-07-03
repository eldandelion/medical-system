package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.Referral
import java.util.Optional

interface ReferralRepository {
    fun findAll(): List<Referral>
    fun findById(id: Long): Optional<Referral>
    fun save(referral: Referral): Referral
    fun deleteAll()
}
