# Implementation Plan: Trial Admin Doctor Assignment & Referral Rejection

## Overview
Implement the doctor assignment and referral rejection workflow for Trial Admins. This includes exposing the assignment endpoints in the backend, dynamically fetching available doctors, updating the frontend dialogue to use this dynamic list, and ensuring rejection payloads are transmitted correctly.

## Architecture Decisions
- **RESTful Endpoints**: Adding `GET /api/doctors` for fetching available doctors, and `POST /api/referrals/{id}/assign` to finalize the assignment.
- **Frontend State Management**: Transitioning `useReferralActions` to expect numerical string IDs (`"1"`) instead of mock strings (`"李医生"`) and fetching doctor options asynchronously using `@tanstack/react-query`.
- **Domain Modeling**: The `AssignDoctorDto` strictly consumes `doctorId` (Long). The domain layer (`ReferralService`) derives `departmentId` implicitly via the `UserRepository`.

## Task List

### Phase 1: Foundation (Backend)
- [ ] Task 1: Create Doctor Controller and fetch endpoint
- [ ] Task 2: Implement and expose `assignDoctor` in ReferralController

### Checkpoint: Foundation
- [ ] Maven tests for controllers pass
- [ ] Backend API endpoints are successfully mapped

### Phase 2: Core Features (Frontend Integration)
- [ ] Task 3: Update `useReferralActions` default state
- [ ] Task 4: Update `ReferralDetailsView.tsx` to fetch `GET /api/doctors` and populate `<md-select-option>` dynamically

### Checkpoint: Core Features
- [ ] End-to-end flow works in frontend (fetch doctors -> select doctor -> assign -> verify state updates to WAITING_FOR_SCHEDULING)

### Phase 3: Polish (Referral Rejection Validation)
- [ ] Task 5: Verify the existing Rejection endpoint and frontend payload

### Checkpoint: Complete
- [ ] All acceptance criteria met
- [ ] Ready for review

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Frontend parsing of `md-select-option` value | Medium | Explicitly pass `e.target.value` as `String` containing the `Long` ID and ensure backend correctly parses string inputs into `Long`. |
| Missing mock doctors during testing | Low | Backend `UserRepository` mocks doctor creation if none exist when fetching. |

## Open Questions
- None.
