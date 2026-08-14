package com.medicalsystem.backend.storage.domain

enum class FileStatus {
    PENDING_UPLOAD, // 1
    ACTIVE,         // 2
    REJECTED,       // 3
    SOFT_DELETED    // 4
}

enum class FileCategory {
    AVATAR,               // 1
    REFERRAL_ATTACHMENT,  // 2
    FEEDBACK_ATTACHMENT   // 3
}
