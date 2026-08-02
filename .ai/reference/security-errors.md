# Security, Authentication, & Error Handling Reference

## 1. Authentication & Authorization Architecture

The system employs a **"Black Box" Security Pattern** designed to completely decouple authentication parsing from controllers and domain services.

```text
HTTP Request (Authorization: Bearer <token>)
       │
       ▼
MockAuthenticationFilter (Servlet Filter)
       │ Extracts token, resolves User, binds to thread
       ▼
MockSecurityContextHolder (ThreadLocal)
       │
       ▼
CurrentUserArgumentResolver (WebMvcConfigurer)
       │ Injects User into @CurrentUser parameter
       ▼
RestController method: fun endpoint(@CurrentUser user: User?)
```

### 1. Filter & Context Lifecycle
- **`MockAuthenticationFilter`**: Intercepts all requests, parses `Authorization: Bearer <token>`, looks up the matching `User` aggregate, and sets `MockSecurityContextHolder.getContext().user = user`.
- **Thread Safety**: Clears the context inside the `finally` block of `doFilter()` to prevent thread contamination and memory leaks.
- **Future Spring Security Compatibility**: Replacing mock tokens with cryptographic JWTs requires only swapping `MockAuthenticationFilter` with a standard `JwtAuthenticationFilter`. Zero controller or service modifications will be needed.

### 2. Controller Parameter Injection
Controllers must declare `@CurrentUser user: User?` rather than parsing headers:

```kotlin
@PostMapping("/api/referrals/{id}/approve")
fun approveReferral(
    @PathVariable id: Long,
    @Valid @RequestBody dto: ApproveReferralDto,
    @CurrentUser user: User?
): ReferralDto {
    val currentUser = user ?: throw ForbiddenException("Authorized user not found")
    return referralService.approveReferral(id, dto, currentUser)
}
```

### 3. Role-Based Authorization & Visibility Policies
- **Role Verification**: Services explicitly verify roles before executing privileged actions:
  ```kotlin
  if (user.role != UserRole.HEAD_COUNSELLOR) {
      throw ForbiddenException("Only Head Counsellors can perform this operation")
  }
  ```
- **Row-Level Security**: Services pass `user` into repository adapters (`findVisibleReferralsFor(user)`, `findByIdAndVisibleTo(id, user)`), ensuring queries execute database-level `JpaSpecification` filters based on domain `VisibilityPolicy`.

---

## 2. Backend Exception Handling & Standard Error Responses

Centralized error handling is managed by `@RestControllerAdvice` in [GlobalExceptionHandler.kt](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/exception/GlobalExceptionHandler.kt).

### Standard Error Response Formats

#### 1. Generic & Domain Errors (400, 403, 404, 409)
Returned for missing resources, rule violations, or unauthorized access:
```json
{
  "error": "Referral with ID 42 not found"
}
```

#### 2. Bean Validation Failures (400 BAD_REQUEST)
Triggered when `@Valid @RequestBody` validation constraints fail:
```json
{
  "error": "Validation failed",
  "details": {
    "title": "Title is required",
    "studentId": "Student ID is required"
  }
}
```

### Exception Class Hierarchy & Status Mappings
| Exception Class | HTTP Status | Typical Usage |
| :--- | :--- | :--- |
| **`ForbiddenException`** | `403 FORBIDDEN` | Missing auth session or role mismatch. |
| **`ResourceNotFoundException`** / **`NotFoundException`** | `404 NOT_FOUND` | Missing entity or resource hidden by visibility policy. |
| **`ConflictException`** | `409 CONFLICT` | Concurrent modification or duplicate resource. |
| **`ValidationException`** | `400 BAD_REQUEST` | Business rule validation failure. |
| **`InvalidReferralTransitionException`** | `400 BAD_REQUEST` | State transition violation in domain aggregate. |
| **`MethodArgumentNotValidException`** | `400 BAD_REQUEST` | Jakarta `@Valid` annotation constraint failure. |

---

## 3. Frontend Authentication Capture & Error Handling

### 1. Role & Token Management (`AuthContext`)
- `AuthContext` stores the active persona session (`session: { role, token }`).
- Switching roles via `setRole(newRole)` automatically executes **`queryClient.clear()`** to wipe TanStack Query memory cache and prevent data cross-contamination between roles.

### 2. Role-Based View Orchestration (`App.tsx`)
`App.tsx` conditionally mounts dedicated page orchestrators based on `session.role`:
- `'student'` ➔ `<StudentPage />`
- `'teacher'` ➔ `<TeacherPage />`
- `'head-councillor'` ➔ `<HeadCouncillorPage />`
- `'trial-admin'` ➔ `<TrialAdminPage />`
- `'doctor'` ➔ `<DoctorPage />`

### 3. API Error Extraction & Feedback Strategy
All frontend mutations and queries follow a unified error extraction pipeline:

```ts
const res = await fetch(url, { headers: { 'Authorization': `Bearer ${session.token}` } });

if (!res.ok) {
  let errorMessage = 'Request failed';
  try {
    const errorData = await res.json();
    if (errorData.message) {
      errorMessage = errorData.message;
    } else if (errorData.error && errorData.details) {
      errorMessage = Object.values(errorData.details).join(', ');
    } else if (errorData.error) {
      errorMessage = errorData.error;
    }
  } catch (e) {
    // Non-JSON response fallback
  }
  throw new Error(errorMessage);
}
```

- **Mutation Feedback**: Handled by `onError: (err) => showSnackbar({ message: err.message, duration: 5000 })`.
- **Query Feedback**: Checked via `isError` on `useQuery()`, rendering centered error icons and human-readable error descriptions.

---

## 4. Strict Security Rules When Adding Endpoints & Pages

### Backend Rules (Non-Negotiable)
1. **No Manual Header Parsing**: NEVER inspect `HttpServletRequest.getHeader("Authorization")` in controllers or services. Always use `@CurrentUser user: User?`.
2. **Null User Guards**: Every secured controller endpoint MUST start with:
   ```kotlin
   val currentUser = user ?: throw ForbiddenException("Authorized user not found")
   ```
3. **Always Pass User to Queries**: Never query entities via raw `findById()` if the resource is subject to visibility policies. Always use `findByIdAndVisibleTo(id, currentUser)` or `findVisibleReferralsFor(currentUser)`.
4. **Enforce Input Validation**: Every request payload DTO MUST be marked with `@Valid @RequestBody` with appropriate Jakarta validation annotations on properties (`@field:NotBlank`, `@field:NotNull`).

### Frontend Rules (Non-Negotiable)
1. **Always Attach Bearer Token**: Every backend `fetch` call must include `'Authorization': 'Bearer ' + session.token`.
2. **Never Persist Stale Multi-Role Data**: Do NOT bypass `queryClient.clear()` when switching roles.
3. **Graceful Error UI**: Components must never break or render blank white screens on API errors. Always check `isError` or wrap actions in `try/catch` with `showSnackbar()`.
