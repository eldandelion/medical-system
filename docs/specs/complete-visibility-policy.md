# Complete Referral Visibility Policy

This document outlines the exact visibility rules for all user roles regarding Referrals. It defines which referrals a user can see based on their relationship to the referral and its lifecycle state.

## 1. TEACHER
- **Rule:** Can only see referrals they initiated.
- **Criteria:** `referredById == user.id`
- **Statuses:** All statuses (including `DRAFT`, `REJECTED`, `ERROR`).

## 2. STUDENT
- **Rule:** Can only see referrals where they are the subject of the referral. They cannot see drafts or aborted (recalled) submissions.
- **Criteria:** `studentId == user.id` AND `status NOT IN (DRAFT, RECALLED)`
- **Statuses:** All statuses except `DRAFT` and `RECALLED`.

## 3. HEAD COUNSELLOR
- **Rule:** Can see referrals they initiated, plus any referrals that have been submitted for their approval or are awaiting their feedback. Once approved, the referral remains visible to them permanently.
- **Criteria:** `referredById == user.id` OR `status IN (AWAITING_APPROVAL, AWAITING_TRIAGE, WAITING_FOR_SCHEDULING, WAITING_FOR_APPOINTMENT, AWAITING_FEEDBACK_APPROVAL, CLOSED, REJECTED)`
- **Statuses:** Excludes `DRAFT` and `RECALLED` from other users.

## 4. TRIAL ADMIN
- **Rule:** Can see any referral that has reached the Triage stage or beyond in its lifecycle. This specifically ensures they see `REJECTED` or `ERROR` referrals *only* if that rejection/error occurred after the referral reached their jurisdiction. 
- **Criteria:** The referral must have at least one step in its history of type `TRIAGE`, `SCHEDULING`, `EVALUATION`, or `FEEDBACK`. 

## 5. DOCTOR
- **Rule:** Can only see referrals explicitly assigned to them.
- **Criteria:** `destination.doctorId == user.id`
- **Statuses:** All statuses once assigned (this natively covers `WAITING_FOR_SCHEDULING`, `WAITING_FOR_APPOINTMENT`, `AWAITING_FEEDBACK_APPROVAL`, `CLOSED`, `REJECTED`, `ERROR`).

## 6. SYSTEM ADMIN
- **Rule:** Global access.
- **Criteria:** None (sees everything).
