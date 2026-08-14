package com.medicalsystem.backend.entity

import jakarta.persistence.*

@Entity
@Table(name = "referral_attachments")
class AttachmentEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false)
    var name: String,

    @Column(nullable = false)
    var size: String,

    @Column(name = "file_id", nullable = true)
    var fileId: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referral_id", nullable = false)
    var referral: ReferralEntity? = null
)
