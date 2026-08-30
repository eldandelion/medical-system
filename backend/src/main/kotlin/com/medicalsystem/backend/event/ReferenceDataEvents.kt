package com.medicalsystem.backend.event

import com.medicalsystem.backend.model.ReferenceDataStatus
import java.time.LocalDateTime

data class CollegeStatusChangedEvent(
    val collegeId: Long,
    val newStatus: ReferenceDataStatus,
    override val occurredOn: LocalDateTime = LocalDateTime.now()
) : DomainEvent

data class HospitalStatusChangedEvent(
    val hospitalId: Long,
    val newStatus: ReferenceDataStatus,
    override val occurredOn: LocalDateTime = LocalDateTime.now()
) : DomainEvent
