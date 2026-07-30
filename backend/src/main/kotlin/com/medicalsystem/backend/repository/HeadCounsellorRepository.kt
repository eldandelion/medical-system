package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.HeadCounsellor
import java.util.Optional

interface HeadCounsellorRepository {
    fun findById(id: Long): Optional<HeadCounsellor>
}
