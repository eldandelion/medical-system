package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.ScaleDraftEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface ScaleDraftJpaRepository : JpaRepository<ScaleDraftEntity, Long> {
    fun findByStudentIdAndScaleCode(studentId: Long, scaleCode: String): Optional<ScaleDraftEntity>
    fun deleteByStudentIdAndScaleCode(studentId: Long, scaleCode: String)
    fun existsByStudentIdAndScaleCode(studentId: Long, scaleCode: String): Boolean
}
