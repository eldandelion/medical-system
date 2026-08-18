package com.medicalsystem.backend.model

import java.net.URI
import java.time.Instant

data class User(
    val id: Long,
    val name: String,
    val email: EmailAddress,
    val avatarUrl: URI? = null,
    val role: UserRole,
    val status: AccountStatus = AccountStatus.ACTIVE,
    val deletedAt: Instant? = null
)
