# Doctor Assignment & Referral Rejection Specification

## 1. Overview
This specification details the changes required to enable a **Trial Admin** (Triage Admin) to assign doctors to referrals and reject referrals that are in the triage phase within the University Medical Screening System. 

## 2. Workflows & State Transitions

### 2.1 Doctor Assignment
- **Trigger**: Trial Admin clicks "分配医生" (Assign Doctor) in the Referral Details view and confirms a doctor selection.
- **Initial State**: `AWAITING_TRIAGE` or `NEEDS_REASSIGNMENT`.
- **Action**: `ASSIGN_DOCTOR` or `REASSIGN_DOCTOR`.
- **Target State**: `WAITING_FOR_SCHEDULING`.
- **Side Effects**:
  - The `destination` property of the `Referral` is updated with the selected `doctorId`.
  - The `departmentId` is inferred from the `Doctor` entity.
  - The `triageAdminId` is set to the acting Trial Admin's user ID.
  - Domain events (`ReferralStatusChangedEvent`) are published.

### 2.2 Referral Rejection
- **Trigger**: Trial Admin clicks "拒绝" (Reject) and provides a required reason.
- **Initial State**: `AWAITING_TRIAGE` or `NEEDS_REASSIGNMENT`.
- **Action**: `REJECT_REFERRAL`.
- **Target State**: `REJECTED`.
- **Side Effects**:
  - The active `ReferralStep` is closed with status `ISSUE` and the provided rejection reason is recorded.
  - Domain events are published.

## 3. Backend API Changes

### 3.1 DTOs
**`AssignDoctorDto`**
- `doctorId` (Long, NotNull): The unique identifier of the doctor being assigned.

### 3.2 Services & Entities
**`ReferralService.assignDoctor(id: Long, dto: AssignDoctorDto, token: String?)`**
- Verifies the user has Trial Admin privileges.
- Verifies the referral's current state allows `ASSIGN_DOCTOR`.
- Verifies the provided `doctorId` exists and belongs to a user with the `DOCTOR` role.
- Updates the `Referral.destination` and transitions the state to `WAITING_FOR_SCHEDULING`.

### 3.3 Controllers
**`DoctorController`**
- New Endpoint: `GET /api/doctors`
  - Returns: List of `DoctorDto` containing `id`, `name`, and `departmentName`.

**`ReferralController`**
- New Endpoint: `POST /api/referrals/{id}/assign`
  - Body: `AssignDoctorDto`
  - Returns: `ReferralDto`

## 4. Frontend Changes

### 4.1 UI Components (`ReferralDetailsView.tsx`)
- The "Assign Doctor" dialog must fetch the list of available doctors via `GET /api/doctors` using `useQuery`.
- The `<md-outlined-select>` must dynamically iterate over the fetched list and populate `<md-select-option>` elements.
- Options must send the doctor's numeric `id` as the value, displaying the doctor's `name` and `departmentName` in the option UI.
- Mock hardcoded doctor entries will be completely removed.

### 4.2 State Management (`useReferralActions.ts`)
- Update the state initialization logic to support dynamic doctor lists (e.g., setting the initial selected ID dynamically once data is fetched).
- Ensure the payload correctly passes the numeric identifier when triggering the assignment request.

## 5. Testing Requirements
- **TDD Enforcement**: Ensure `ReferralServiceTest` contains assertions that validate:
  1. Successful `assignDoctor` transitions the status to `WAITING_FOR_SCHEDULING` and persists the selected `doctorId` in `destination`.
  2. Successful `rejectReferral` transitions the status to `REJECTED` and accurately records the rejection reason within the active referral step.
