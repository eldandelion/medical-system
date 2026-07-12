package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.AppointmentEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant

interface AppointmentRepository : JpaRepository<AppointmentEntity, Long> {
    
    @Query("""
        SELECT a FROM AppointmentEntity a 
        WHERE a.doctorId = :doctorId 
        AND a.appointmentTime >= :start 
        AND a.appointmentTime <= :end 
        AND a.deletedAt IS NULL 
        AND a.status != com.medicalsystem.backend.model.AppointmentStatus.CANCELLED
    """)
    fun findActiveAppointmentsForDoctorWithinTimeframe(
        @Param("doctorId") doctorId: Long,
        @Param("start") start: Instant,
        @Param("end") end: Instant
    ): List<AppointmentEntity>
}
