package com.medicalsystem.backend.exception

class AssessmentValidationException(
    val missingKeys: List<String> = emptyList(),
    val invalidKeys: List<String> = emptyList()
) : RuntimeException("Assessment validation failed")
