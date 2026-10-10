package com.medicalsystem.backend.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "assessment_dispatches")
class AssessmentDispatchEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(name = "battery_code", nullable = false)
    var batteryCode: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispatched_by_user_id", nullable = false)
    var dispatchedByUser: UserEntity,

    @Column(name = "dispatched_at", nullable = false)
    var dispatchedAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "dispatch_type", nullable = false)
    @Enumerated(EnumType.STRING)
    var dispatchType: com.medicalsystem.backend.model.DispatchType = com.medicalsystem.backend.model.DispatchType.ROUTINE_SCREENING,

    @Column(name = "target_cohort")
    var targetCohort: String? = null,

    @Column(name = "due_date")
    var dueDate: java.time.LocalDate? = null,

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var status: com.medicalsystem.backend.model.DispatchStatus = com.medicalsystem.backend.model.DispatchStatus.ACTIVE
)
