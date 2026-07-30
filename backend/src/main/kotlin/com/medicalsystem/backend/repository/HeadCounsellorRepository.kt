package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.HeadCounsellor
import java.util.Optional

interface HeadCounsellorRepository {
    fun findById(id: Long): Optional<HeadCounsellor>
    fun findAll(): List<HeadCounsellor>
    fun save(headCounsellor: HeadCounsellor): HeadCounsellor
    fun findBySchoolId(schoolId: Long): Optional<HeadCounsellor>
}
