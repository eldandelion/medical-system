package com.medicalsystem.backend.entity

import com.medicalsystem.backend.model.AssessmentScaleType
import com.medicalsystem.backend.model.AssessmentStatus
import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(
    name = "assessment_assignments",
    indexes = [
        Index(name = "idx_assignment_student", columnList = "student_id"),
        Index(name = "idx_assignment_status", columnList = "status"),
        Index(name = "idx_assignment_scale_type", columnList = "scale_type")
    ]
)
class AssessmentAssignmentEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    var student: StudentEntity,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_user_id", nullable = false)
    var assignedByUser: UserEntity,

    @Column(name = "scale_type", nullable = false)
    var scaleType: AssessmentScaleType,

    @Column(nullable = false)
    var status: AssessmentStatus = AssessmentStatus.PENDING,

    @Column(name = "assigned_at", nullable = false)
    var assignedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "completed_at")
    var completedAt: LocalDateTime? = null,

    @Column(name = "due_date")
    var dueDate: LocalDate? = null,

    @Column(name = "answers_json", columnDefinition = "TEXT")
    var answersJson: String? = null,

    @Column(name = "psychometric_test_id")
    var psychometricTestId: Long? = null
)
