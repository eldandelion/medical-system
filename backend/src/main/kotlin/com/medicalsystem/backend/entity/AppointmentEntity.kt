package com.medicalsystem.backend.entity

import com.medicalsystem.backend.converter.AppointmentStatusConverter
import com.medicalsystem.backend.model.AppointmentStatus
import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "appointment_entity", indexes = [
    Index(name = "idx_appointment_doctor_time", columnList = "doctor_id, appointment_time, status")
])
class AppointmentEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referral_id", nullable = true) // Nullable for isolated testing
    var referral: ReferralEntity? = null,

    @Column(name = "doctor_id", nullable = false)
    var doctorId: Long,

    @Column(name = "appointment_time", nullable = false)
    var appointmentTime: Instant,

    @Convert(converter = AppointmentStatusConverter::class)
    @Column(nullable = false)
    var status: AppointmentStatus = AppointmentStatus.SCHEDULED,

    @Column(nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(name = "deleted_at")
    var deletedAt: Instant? = null
)
