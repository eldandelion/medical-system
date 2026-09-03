package com.medicalsystem.backend.model

/**
 * 1-based integer persistent lifecycle status for reference dictionaries:
 * 1: ACTIVE (Available for new selections and operations)
 * 2: DEPRECATED (Soft deleted; excluded from new selections, preserved for historical records)
 */
enum class ReferenceDataStatus {
    ACTIVE,
    DEPRECATED
}

enum class ReferenceCategory {
    COLLEGE,
    MAJOR,
    SCHOOL_DEPARTMENT,
    SCHOOL,
    HOSPITAL,
    HOSPITAL_DEPARTMENT,
    ETHNICITY,
    DEGREE_LEVEL
}

enum class ReferenceSubjectType {
    STUDENT,
    TEACHER,
    HEAD_COUNSELLOR,
    TRIAL_ADMIN,
    DOCTOR,
    REFERRAL,
    MAJOR,
    HOSPITAL_DEPARTMENT,
    SCHOOL_DEPARTMENT
}
