package com.medicalsystem.backend.storage.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "shedlock")
class ShedlockEntity(
    @Id
    @Column(name = "name", length = 64, nullable = false)
    val name: String = "",

    @Column(name = "lock_until", nullable = false)
    val lockUntil: Instant = Instant.now(),

    @Column(name = "locked_at", nullable = false)
    val lockedAt: Instant = Instant.now(),

    @Column(name = "locked_by", length = 255, nullable = false)
    val lockedBy: String = ""
)
