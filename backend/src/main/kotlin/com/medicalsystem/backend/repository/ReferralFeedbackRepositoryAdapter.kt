package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.FeedbackAttachmentEntity
import com.medicalsystem.backend.entity.ReferralFeedbackEntity
import com.medicalsystem.backend.model.FeedbackAttachment
import com.medicalsystem.backend.model.ReferralFeedback
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
class ReferralFeedbackRepositoryAdapter(
    private val jpaRepository: ReferralFeedbackJpaRepository
) : ReferralFeedbackRepository {

    override fun save(feedback: ReferralFeedback): ReferralFeedback {
        val entity = feedback.toEntity()
        val savedEntity = jpaRepository.save(entity)
        return savedEntity.toDomain()
    }

    override fun findByReferralId(referralId: Long): Optional<ReferralFeedback> {
        return jpaRepository.findByReferralId(referralId).map { it.toDomain() }
    }
}

// Mapper Extension Functions
fun ReferralFeedback.toEntity(): ReferralFeedbackEntity {
    return ReferralFeedbackEntity(
        id = if (this.id == 0L) null else this.id,
        referralId = this.referralId,
        content = this.content,
        attachments = this.attachments.map { it.toEntity() }.toMutableList(),
        createdAt = this.createdAt
    )
}

fun FeedbackAttachment.toEntity(): FeedbackAttachmentEntity {
    return FeedbackAttachmentEntity(
        id = if (this.id == 0L) null else this.id,
        name = this.name,
        sizeBytes = this.sizeBytes,
        fileUrl = this.fileUrl
    )
}

fun ReferralFeedbackEntity.toDomain(): ReferralFeedback {
    return ReferralFeedback(
        id = this.id ?: 0L,
        referralId = this.referralId,
        content = this.content,
        attachments = this.attachments.map { it.toDomain() },
        createdAt = this.createdAt
    )
}

fun FeedbackAttachmentEntity.toDomain(): FeedbackAttachment {
    return FeedbackAttachment(
        id = this.id ?: 0L,
        name = this.name,
        sizeBytes = this.sizeBytes,
        fileUrl = this.fileUrl
    )
}
