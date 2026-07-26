package com.medicalsystem.backend.model

import java.net.URI

data class User(
    val id: Long,
    val name: String,
    val email: EmailAddress,
    val avatarUrl: URI? = null,
    val role: UserRole
)
