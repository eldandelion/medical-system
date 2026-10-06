# Recent Activity Feature Architecture

## 1. Overview
This document outlines the design for the "近期动态" (Recent Activity) feature on the Dashboard. It aggregates pending tasks and recent system events into a single timeline feed of up to 5 items, customized per user role.

## 2. API Contract & DTOs
We will expose a unified endpoint: `GET /api/dashboard/activity`

### DTOs
To comply with the rule against magic/presentation strings in the backend, the API will return strictly typed enums and identifiers. The frontend will localize these into display strings.

```kotlin
enum class ActivityType {
    // Referrals
    REFERRAL_PENDING_TRIAGE,
    REFERRAL_PENDING_SCHEDULING,
    REFERRAL_PENDING_FEEDBACK,
    REFERRAL_STATUS_UPDATED,
    
    // Assessments
    ASSESSMENT_PENDING_COMPLETION,
    HIGH_RISK_ASSESSMENT_SUBMITTED,
    
    // Approvals (Admin)
    USER_APPROVAL_PENDING,
    
    // Notifications & Alerts
    UNREAD_NOTIFICATION,
    SYSTEM_NOTIFICATION,
    HOSPITAL_CAPACITY_ALERT
}

data class DashboardActivityDto(
    val id: String, // Unique string, e.g., "ref-123", "notif-45"
    val type: ActivityType,
    val timestamp: java.time.Instant,
    val referenceId: Long, // ID of the underlying entity
    val referenceName: String? // Optional contextual data (e.g., Student name or Assessment title)
)

data class DashboardActivityFeedDto(
    val activities: List<DashboardActivityDto>
)
```

## 3. Backend Implementation

### Controller (`DashboardController.kt`)
Add a new mapping:
```kotlin
@GetMapping("/activity")
fun getRecentActivity(@CurrentUser user: User): ResponseEntity<DashboardActivityFeedDto> {
    return ResponseEntity.ok(dashboardService.getRecentActivity(user))
}
```

### Service (`DashboardService.kt`)
The service will implement role-specific queries to gather activities.

```kotlin
fun getRecentActivity(user: User): DashboardActivityFeedDto {
    val activities = mutableListOf<DashboardActivityDto>()
    
    when (user.role) {
        UserRole.STUDENT -> {
            // Fetch top status changes on their own referrals (REFERRAL_STATUS_UPDATED)
            // Fetch top pending assigned assessments they need to complete (ASSESSMENT_PENDING_COMPLETION)
        }
        UserRole.TEACHER -> {
            // Fetch top high-risk assessment submissions from assigned students (HIGH_RISK_ASSESSMENT_SUBMITTED)
            // Fetch top referral status updates for assigned students (REFERRAL_STATUS_UPDATED)
        }
        UserRole.HEAD_COUNSELLOR -> {
            // Fetch top referrals awaiting triage (REFERRAL_PENDING_TRIAGE)
            // Fetch top high-risk assessment submissions (HIGH_RISK_ASSESSMENT_SUBMITTED)
            // Fetch top system-wide unread notifications (SYSTEM_NOTIFICATION)
        }
        UserRole.TRIAL_ADMIN -> {
            // Fetch top referrals waiting for scheduling (REFERRAL_PENDING_SCHEDULING)
            // Fetch top unread notifications (UNREAD_NOTIFICATION)
            // Fetch top hospital staff capacity alerts (HOSPITAL_CAPACITY_ALERT)
        }
        UserRole.DOCTOR -> {
            // Fetch top referrals waiting for appointment/feedback (REFERRAL_PENDING_FEEDBACK)
            // Fetch top important unread notifications (UNREAD_NOTIFICATION)
        }
        UserRole.SYSTEM_ADMIN -> {
            // Fetch top user registrations pending approval (USER_APPROVAL_PENDING)
        }
    }
    
    // Sort all fetched items by timestamp descending
    activities.sortByDescending { it.timestamp }
    
    // Return top 5
    return DashboardActivityFeedDto(activities.take(5))
}
```
**Data Access**: Existing repositories (e.g., `ReferralRepository`, `NotificationRepository`, `AssessmentAssignmentRepository`) will need custom queries (e.g., `findTop5By...OrderByCreatedAtDesc`) to efficiently fetch recent items without loading entire tables into memory. The aggregation strategy is to execute parallel or sequential queries for the required types for each role (fetching up to 5 each), merge them into the `activities` list, sort them by `timestamp` descending in memory, and slice the top 5 to return.

## 4. Frontend Integration
### API Client
- Create `DashboardActivityDto` interface mirroring the backend.
- Create a `useDashboardActivity` React Query hook scoped by `session.token`.

### Component Updates (`DashboardView.tsx`)
- Map `DashboardActivityDto` to the UI's activity item format.
- The frontend mapper will use `ActivityType` to generate the correct localized text using Material Design 3 Web Components without relying on backend magic strings.
