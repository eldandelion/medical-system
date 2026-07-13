package com.medicalsystem.backend.entity

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(
    name = "referral_feedback",
    indexes = [
        Index(name = "idx_referral_feedback", columnList = "referral_id", unique = true)
    ]
)
class ReferralFeedbackEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    
    @Column(name = "referral_id", nullable = false)
    var referralId: Long,
    
    @Column(columnDefinition = "TEXT", nullable = false)
    var content: String,
    
    @OneToMany(cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "feedback_id")
    var attachments: MutableList<FeedbackAttachmentEntity> = mutableListOf(),

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: Instant = Instant.now()
)
