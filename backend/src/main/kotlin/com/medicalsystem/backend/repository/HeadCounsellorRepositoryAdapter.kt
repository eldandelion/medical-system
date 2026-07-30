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

    override fun save(headCounsellor: HeadCounsellor): HeadCounsellor {
        // We might need an entity mapper, but let's assume we can map it manually for now if needed. 
        // Or if save is not used, just throw NotImplementedError
        TODO("Not implemented")
    }

    override fun findBySchoolId(schoolId: Long): Optional<HeadCounsellor> {
        return jpaRepository.findAll().stream()
            .filter { it.schoolId == schoolId }
            .findFirst()
            .map { entity ->
                HeadCounsellor(
                    userId = entity.userId,
                    employeeNumber = SchoolEmployeeId(entity.employeeNumber),
                    schoolId = entity.schoolId,
                    departmentId = entity.departmentId
                )
            }
    }
}
