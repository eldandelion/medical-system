package com.medicalsystem.backend.entity

import jakarta.persistence.*

@Entity
@Table(
    name = "feedback_attachments"
)
class FeedbackAttachmentEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    
    @Column(nullable = false)
    var name: String,
    
    @Column(name = "size_bytes", nullable = false)
    var sizeBytes: Long,
    
    @Column(name = "file_url", nullable = true)
    var fileUrl: String? = null,

    @Column(name = "file_id", nullable = true)
    var fileId: Long? = null
)
