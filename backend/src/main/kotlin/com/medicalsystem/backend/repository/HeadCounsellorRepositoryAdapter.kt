package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.HeadCounsellor
import com.medicalsystem.backend.model.SchoolEmployeeId
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
class HeadCounsellorRepositoryAdapter(
    private val jpaRepository: HeadCounsellorJpaRepository
) : HeadCounsellorRepository {
    override fun findById(id: Long): Optional<HeadCounsellor> {
        return jpaRepository.findById(id).map { entity ->
            HeadCounsellor(
                userId = entity.userId,
                employeeNumber = SchoolEmployeeId(entity.employeeNumber),
                schoolId = entity.schoolId,
                departmentId = entity.departmentId
            )
        }
    }

    override fun findAll(): List<HeadCounsellor> {
        return jpaRepository.findAll().map { entity ->
            HeadCounsellor(
                userId = entity.userId,
                employeeNumber = SchoolEmployeeId(entity.employeeNumber),
                schoolId = entity.schoolId,
                departmentId = entity.departmentId
            )
        }
    }
}
