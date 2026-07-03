package com.medicalsystem.backend.model

import com.medicalsystem.backend.event.DomainEvent

abstract class AggregateRoot {
    private val domainEvents: MutableList<DomainEvent> = mutableListOf()

    protected fun registerEvent(event: DomainEvent) {
        domainEvents.add(event)
    }

    fun getDomainEvents(): List<DomainEvent> {
        return domainEvents.toList()
    }

    fun clearDomainEvents() {
        domainEvents.clear()
    }
}
