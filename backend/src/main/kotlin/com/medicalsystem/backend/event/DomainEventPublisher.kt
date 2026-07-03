package com.medicalsystem.backend.event

interface DomainEventPublisher {
    fun publish(event: DomainEvent)
}
