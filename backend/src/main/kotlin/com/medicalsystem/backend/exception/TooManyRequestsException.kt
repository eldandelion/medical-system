package com.medicalsystem.backend.exception

/**
 * Thrown when a client exceeds a rate limit or quota (e.g. SMS send-code per-IP limits).
 * Mapped to HTTP 429 by GlobalExceptionHandler.
 */
class TooManyRequestsException(message: String) : RuntimeException(message)
