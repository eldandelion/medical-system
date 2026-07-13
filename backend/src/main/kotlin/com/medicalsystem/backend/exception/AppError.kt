package com.medicalsystem.backend.exception

/**
 * Base exception class for all application-specific errors.
 */
abstract class AppError(message: String) : RuntimeException(message)
