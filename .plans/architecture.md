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
    
    // Assessments
    ASSESSMENT_PENDING_COMPLETION,
    ASSESSMENT_RECENTLY_COMPLETED,
    
    // Approvals (Admin)
    USER_APPROVAL_PENDING,
    
    // Notifications
    UNREAD_NOTIFICATION
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
            // Fetch top unread notifications, pending assessments
        }
        UserRole.TEACHER -> {
            // Fetch unread notifications, pending assessments for their students
        }
        UserRole.HEAD_COUNSELLOR -> {
            // Fetch referrals pending triage
        }
        UserRole.TRIAL_ADMIN -> {
            // Fetch referrals pending scheduling
        }
        UserRole.DOCTOR -> {
            // Fetch referrals pending feedback/appointments
        }
        UserRole.SYSTEM_ADMIN -> {
            // Fetch pending user approvals
        }
    }
    
    // Sort all fetched items by timestamp descending
    activities.sortByDescending { it.timestamp }
    
    // Return top 5
    return DashboardActivityFeedDto(activities.take(5))
}
```
**Data Access**: Existing repositories (e.g., `ReferralRepository`, `NotificationRepository`) will need custom queries (`findTop5By...OrderByCreatedAtDesc`) to efficiently fetch recent items without loading entire tables into memory.

## 4. Frontend Integration
### API Client
- Create `DashboardActivityDto` interface mirroring the backend.
- Create a `useDashboardActivity` React Query hook scoped by `session.token`.

### Component Updates (`DashboardView.tsx`)
- The `DashboardView` component already supports passing `activities` of type `ActivityItem[]`.
- We will map `DashboardActivityDto` to `ActivityItem` inside the dashboard route components.
- The frontend mapper will use `ActivityType` to generate the correct localized `title`, `statusText`, and `statusType` without relying on backend magic strings.
- We will ensure `placeholderData` is properly utilized if needed, and rely on the existing M3 UI components.
