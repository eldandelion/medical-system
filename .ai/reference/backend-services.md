# Backend Services, Controllers, & Domain Logic Reference

## 1. REST Controller Conventions & Endpoint Standards

REST controllers in `com.medicalsystem.backend.controller` define the external HTTP boundary.

### Endpoint Naming & Routing
- Root URLs are plural nouns under `/api/*` (e.g. `/api/referrals`, `/api/students`, `/api/notifications`).
- Specific resource actions use explicit POST verbs (e.g. `/api/referrals/{id}/approve`, `/api/referrals/{id}/assign-doctor`, `/api/referrals/{id}/recall`).

### Security Injection via `@CurrentUser`
Controllers must not read raw HTTP authorization headers or security tokens directly. Instead, accept the injected `@CurrentUser user: User?` parameter resolved by the security filter:

```kotlin
@RestController
@RequestMapping("/api/referrals")
class ReferralController(
    private val referralService: ReferralService
) {
    @GetMapping("/{id}")
    fun fetchReferralDetails(
        @PathVariable id: Long,
        @CurrentUser user: User?
    ): ReferralDetailsDto {
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")
        return referralService.fetchReferralDetails(id, currentUser)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun initiateReferral(
        @Valid @RequestBody dto: CreateReferralDto,
        @CurrentUser user: User?
    ): ReferralDto {
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")
        return referralService.initiateReferral(dto, currentUser)
    }
}
```

### HTTP Status Code Conventions
- `200 OK`: Default for successful GET, PUT, and action POSTs.
- `201 CREATED`: Resource creation via `@ResponseStatus(HttpStatus.CREATED)`.
- `400 BAD_REQUEST`: Triggered automatically on `@Valid` bean validation failure.
- `403 FORBIDDEN`: Thrown via `ForbiddenException` when user session is missing or unauthorized.
- `404 NOT_FOUND`: Thrown via `ResourceNotFoundException` when entities do not exist.
- `409 CONFLICT` / `422 UNPROCESSABLE_ENTITY`: Thrown via `InvalidReferralTransitionException` or `ValidationException`.

---

## 2. Service Layer & Transaction Boundaries

Services in `com.medicalsystem.backend.service` coordinate business transactions, domain aggregates, and domain events.

### Class & Method Transaction Standards
- Annotate the service class with `@Transactional(readOnly = true)` to optimize read paths.
- Annotate state-mutating methods with `@Transactional`.

```kotlin
@Service
@Transactional(readOnly = true)
class ReferralService(
    private val referralRepository: ReferralRepository,
    private val studentRepository: StudentRepository,
    private val referralMapper: ReferralMapper,
    private val eventPublisher: DomainEventPublisher
) {
    @Transactional
    fun approveReferral(id: Long, dto: ApproveReferralDto, user: User): ReferralDto {
        // 1. Fetch domain aggregate (respecting visibility permissions)
        val referral = referralRepository.findByIdAndVisibleTo(id, user)
            .orElseThrow { ResourceNotFoundException("Referral with ID $id not found") }

        // 2. Enforce domain permissions
        if (user.role != UserRole.HEAD_COUNSELLOR) {
            throw ForbiddenException("Only Head Counsellors can approve referrals")
        }

        // 3. Execute domain aggregate logic (state transition & internal events)
        referral.approve(HospitalId(dto.hospitalId), user.id)

        // 4. Save modified aggregate through adapter
        val saved = referralRepository.save(referral)

        // 5. Publish domain events collected during domain operations
        referral.getDomainEvents().forEach { eventPublisher.publish(it) }
        referral.clearDomainEvents()

        // 6. Map and return response DTO
        return mapToDto(saved, user)
    }
}
```

---

## 3. Policy Enforcement & Domain Event Handling

### Role-Based Visibility Policies (`policy/` & `model/*Policy.kt`)
Data visibility is encapsulated in pure Kotlin policy objects returning sealed `VisibilityCriteria`:

```kotlin
object ReferralVisibilityPolicy {
    fun getVisibilityCriteria(user: User): VisibilityCriteria {
        return when (user.role) {
            UserRole.TEACHER -> VisibilityCriteria.ForTeacher(
                teacherId = user.id,
                allowedInitiatorRoles = listOf(UserRole.HEAD_COUNSELLOR)
            )
            UserRole.DOCTOR -> VisibilityCriteria.ByAssignedDoctor(user.id)
            UserRole.STUDENT -> VisibilityCriteria.BySubject(
                studentId = user.id,
                excludedStatuses = listOf(ReferralStatus.DRAFT, ReferralStatus.RECALLED)
            )
            UserRole.TRIAL_ADMIN -> VisibilityCriteria.HasReachedStep(
                stepTypes = listOf(ReferralStepType.TRIAGE, ReferralStepType.SCHEDULING, ReferralStepType.EVALUATION, ReferralStepType.FEEDBACK)
            )
            UserRole.HEAD_COUNSELLOR -> VisibilityCriteria.InitiatedOrStatuses(
                initiatorId = user.id,
                statuses = listOf(ReferralStatus.AWAITING_APPROVAL, ReferralStatus.AWAITING_TRIAGE, ReferralStatus.CLOSED, ...)
            )
            else -> VisibilityCriteria.All
        }
    }
}
```

### Domain Events & `AggregateRoot`
1. Aggregates inherit `AggregateRoot` and register events internally:
   ```kotlin
   abstract class AggregateRoot {
       private val domainEvents: MutableList<DomainEvent> = mutableListOf()
       protected fun registerEvent(event: DomainEvent) { domainEvents.add(event) }
       fun getDomainEvents(): List<DomainEvent> = domainEvents.toList()
       fun clearDomainEvents() { domainEvents.clear() }
   }
   ```
2. Domain events implement `DomainEvent` with an `occurredOn` timestamp:
   ```kotlin
   data class ReferralStatusChangedEvent(
       val referralId: Long,
       val oldStatus: ReferralStatus,
       val newStatus: ReferralStatus,
       val studentId: Long,
       override val occurredOn: LocalDateTime = LocalDateTime.now()
   ) : DomainEvent
   ```

### Decoupled Event Listeners
Secondary concerns (e.g. notifications, risk profile recalculations) are decoupled using Spring transactional listeners:
- **`@Async`**: Runs asynchronously to avoid delaying the client HTTP response.
- **`@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`**: Ensures side effects execute only after database commits succeed.
- **`@Transactional(propagation = Propagation.REQUIRES_NEW)`**: Isolates listener database operations.

```kotlin
@Component
@Transactional(propagation = Propagation.REQUIRES_NEW)
class NotificationEventListener(
    private val notificationService: NotificationService,
    private val lifecycleRoutingPolicy: LifecycleNotificationRoutingPolicy
) {
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun handleReferralStatusChanged(event: ReferralStatusChangedEvent) {
        val referral = referralRepository.findById(event.referralId).orElse(null) ?: return
        val notifications = lifecycleRoutingPolicy.determineNotifications(event, referral)
        notifications.forEach { notificationService.saveNotification(it) }
    }
}
```

---

## 4. Pure Domain Model Structures (`model/`)

Domain models encapsulate business state, validation rules, and valid transitions:

### 1. Rich Domain Aggregates
- **`Referral`**: Maintains transition state machine, clinical statuses, severe risk factors, destination info, appointment schedules, and steps history.
- **`Student`**: Demographics, major affiliation, risk level indicators.
- **`StudentHealthProfile`**: Aggregated psychiatric screening risk scores and severe risk flags.

### 2. Value Objects
Enforce strongly typed invariants across boundaries:
- `HospitalId(val value: Long)`
- `DoctorId(val value: Long)`
- `TriageAdminId(val value: Long)`
- `MobileNumber(val value: String)`
- `IdCardNumber(val value: String)`
- `FileReference(val name: String, val sizeBytes: Long, val url: URI)`

### 3. Rich Domain Enums
Enums encapsulate transition rules and metadata:
- **`ReferralStatus`**: Defines `canTransitionFrom(currentStatus)` and associated `requiresStepType`.
- **`ReferralType`**: `INITIAL`, `FOLLOW_UP`, `EMERGENCY`.
- **`RiskStatus`**: `LOW`, `MEDIUM`, `HIGH`.
- **`UserRole`**: `STUDENT`, `TEACHER`, `HEAD_COUNSELLOR`, `TRIAL_ADMIN`, `DOCTOR`, `SYSTEM_ADMIN`.

---

## 5. Recipe: Adding a New Endpoint from Controller to Service

Follow these steps when creating a new backend endpoint:

1. **Define DTO (`dto/`)**:
   ```kotlin
   data class CustomActionRequestDto(
       @field:NotBlank(message = "Reason is required")
       val reason: String
   )
   ```
2. **Implement Business Logic on Domain Model (`model/`)**:
   ```kotlin
   // Inside domain aggregate
   fun performAction(reason: String, actorId: Long) {
       require(this.status == ExpectedStatus) { "Invalid state for action" }
       // Update state
       registerEvent(CustomActionEvent(this.id!!, reason))
   }
   ```
3. **Add Method in Service (`service/`)**:
   ```kotlin
   @Transactional
   fun handleCustomAction(id: Long, dto: CustomActionRequestDto, user: User): ReferralDto {
       val model = repository.findByIdAndVisibleTo(id, user)
           .orElseThrow { ResourceNotFoundException("Entity not found") }
       
       model.performAction(dto.reason, user.id)
       val saved = repository.save(model)
       
       model.getDomainEvents().forEach { eventPublisher.publish(it) }
       model.clearDomainEvents()
       
       return mapper.toDto(saved, user)
   }
   ```
4. **Expose in Controller (`controller/`)**:
   ```kotlin
   @PostMapping("/{id}/custom-action")
   fun customAction(
       @PathVariable id: Long,
       @Valid @RequestBody dto: CustomActionRequestDto,
       @CurrentUser user: User?
   ): ReferralDto {
       val currentUser = user ?: throw ForbiddenException("Authorized user not found")
       return service.handleCustomAction(id, dto, currentUser)
   }
   ```
5. **Add Event Listener (`event/` - optional)**:
   ```kotlin
   @Async
   @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
   fun onCustomAction(event: CustomActionEvent) {
       // Send notifications or trigger async audit tasks
   }
   ```
