package com.medicalsystem.backend.event

import java.time.LocalDateTime

interface DomainEvent {
    val occurredOn: LocalDateTime
}
