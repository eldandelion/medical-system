package com.medicalsystem.backend.policy

import com.medicalsystem.backend.model.Notification
import com.medicalsystem.backend.event.DomainEvent

interface NotificationRoutingPolicy<T : DomainEvent> {
    fun determineNotifications(event: T, contextId: Long?): List<Notification>
}
