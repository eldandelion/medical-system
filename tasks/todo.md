## Task 1: Create Doctor Controller and fetch endpoint

**Description:** Add an endpoint to list all available doctors with their department names.

**Acceptance criteria:**
- [ ] New `DoctorController` exposes `GET /api/doctors`
- [ ] Endpoint returns list of doctors containing ID, name, and department name

**Verification:**
- [ ] Build succeeds: `mvn test`

**Dependencies:** None

**Files likely touched:**
- `backend/src/main/kotlin/com/medicalsystem/backend/controller/DoctorController.kt`

**Estimated scope:** Small

---

## Task 2: Implement and expose assignDoctor in ReferralController

**Description:** Add the API endpoint for assigning doctors.

**Acceptance criteria:**
- [ ] `ReferralController` exposes `POST /api/referrals/{id}/assign`
- [ ] Validates user is TrialAdmin and delegates to `ReferralService.assignDoctor`

**Verification:**
- [ ] Build succeeds: `mvn test`

**Dependencies:** None

**Files likely touched:**
- `backend/src/main/kotlin/com/medicalsystem/backend/controller/ReferralController.kt`

**Estimated scope:** Small

---

## Task 3: Update useReferralActions default state

**Description:** Make the default selected doctor ID numeric and dynamic.

**Acceptance criteria:**
- [ ] Initial state for selected doctor handles numeric mapping
- [ ] Sends proper format in API request

**Verification:**
- [ ] Type checks pass: `npm run tsc`

**Dependencies:** None

**Files likely touched:**
- `frontend/src/hooks/useReferralActions.ts`

**Estimated scope:** XS

---

## Task 4: Update ReferralDetailsView.tsx to fetch GET /api/doctors

**Description:** Replace the hardcoded `<md-select-option>` list with dynamically fetched data.

**Acceptance criteria:**
- [ ] Uses `useQuery` to fetch `/api/doctors`
- [ ] Maps fetched list into `<md-select-option>` elements using doctor ID as value, displaying name and department name

**Verification:**
- [ ] Frontend builds cleanly

**Dependencies:** Task 1, Task 3

**Files likely touched:**
- `frontend/src/components/records/ReferralDetailsView.tsx`

**Estimated scope:** Small

---

## Task 5: Verify existing Rejection endpoint and frontend payload

**Description:** Ensure that the rejection workflow is complete and functioning.

**Acceptance criteria:**
- [ ] Trial Admin rejection triggers transition to `REJECTED`
- [ ] Reason is recorded

**Verification:**
- [ ] Manual verification in UI

**Dependencies:** None

**Files likely touched:**
- None (just verification)

**Estimated scope:** XS
