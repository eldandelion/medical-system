package com.medicalsystem.backend.exception

abstract class DomainException(message: String) : RuntimeException(message)

class InvalidReferralTransitionException(fromStatus: String, toStatus: String) : 
    DomainException("Invalid transition from $fromStatus to $toStatus")

class DuplicateStudentException(studentNumber: String) : 
    DomainException("Student with number $studentNumber already exists.")

class StudentNotFoundException(studentId: Long) : 
    DomainException("Student $studentId was not found.")
