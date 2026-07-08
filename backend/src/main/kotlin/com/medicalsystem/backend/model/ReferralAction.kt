package com.medicalsystem.backend.model

enum class ReferralAction {
    RECREATE, 
    DELETE_DRAFT, 
    APPROVE_REFERRAL, 
    REJECT_REFERRAL, 
    RECALL_REFERRAL, 
    ASSIGN_DOCTOR, 
    REASSIGN_DOCTOR, 
    SCHEDULE_APPOINTMENT, 
    WRITE_FEEDBACK, 
    REPORT_PROBLEM, 
    ACKNOWLEDGE_FEEDBACK
}
