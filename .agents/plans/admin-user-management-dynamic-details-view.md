# Feature: Dynamic Role-Specific Details View in Admin User Management

The following plan is complete and actionable. Validate documentation, codebase patterns, and task sanity before implementing. Pay special attention to existing component props, TypeScript type contracts, and Material Design 3 tokens.

---

## Feature Description

In the University Medical Screening System's System Administrator portal, the **User Management** tab (`用户治理`) displays a comprehensive list of all institution users across all roles (`STUDENT`, `TEACHER`, `HEAD_COUNSELLOR`, `TRIAL_ADMIN`, `DOCTOR`, `SYSTEM_ADMIN`).

Currently, clicking any user in this list displays a generic [`UserDetailsView`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/admin/UserDetailsView.tsx). This update makes the details side panel **role-aware**:
1. When a user with the **`STUDENT`** role is selected in the User Management list, the details panel dynamically renders the full [`StudentDetailsView`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/students/StudentDetailsView.tsx) (providing clinical overview, psychometric evaluations, and historical screening assessment records).
2. The bottom action area of the details panel presents an **account governance action footer** ([`UserGovernanceFooter`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/admin/UserGovernanceFooter.tsx)) with admin controls (Approve & Enable, Disable, Restore, Soft-Delete) rather than student counseling actions.
3. For all other roles (`TEACHER`, `DOCTOR`, `HEAD_COUNSELLOR`, `TRIAL_ADMIN`, `SYSTEM_ADMIN`), the details panel continues to render [`UserDetailsView`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/admin/UserDetailsView.tsx) with standard account and permission tabs.

---

## User Story

```
As a System Administrator
I want the details panel in the User Management tab to dynamically render full student clinical records and psychometrics when a student is selected, accompanied by account management actions in the footer
So that I can evaluate a student's psychiatric health profile and screening history while managing their account status and access permissions in one unified view.
```

---

## Problem Statement

Administrators auditing accounts in the User Management view need clinical context when evaluating student accounts (e.g. pending registrations, high-risk flagged students, or accounts requiring access suspension). Previously, clicking a student only revealed basic email/identity metadata in `UserDetailsView`, forcing administrators to switch to the "Students" tab to inspect clinical risk and assessment histories.

---

## Solution Statement

1. **Role-Aware Tabs & Header in AdminPage**: Make [`AdminPage.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/pages/AdminPage.tsx) compute the active tabs (`STUDENT_DETAILS_TABS` vs `USER_DETAILS_TABS`), icon, and subtitle dynamically based on whether `selectedItem.role === 'STUDENT'`.
2. **Customizable Footer in StudentDetailsView**: Update [`StudentDetailsView.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/students/StudentDetailsView.tsx) to accept an optional `footer?: React.ReactNode` prop, allowing external views (like Admin User Management) to inject custom governance actions while retaining the default counseling action footer for regular views.
3. **Dedicated User Governance Footer Component**: Create [`UserGovernanceFooter.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/admin/UserGovernanceFooter.tsx) encapsulating status change mutations (`ACTIVE`, `DISABLED`, `DELETED`) with Material Design 3 buttons (`PrimaryButton`, `SecondaryButton`, `DestructiveButton`) inside [`ActionFooter`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/ActionFooter.tsx).
4. **Reactive State Synchronization**: Ensure user status transitions update both the cached query and the selected item state.

---

## Feature Metadata

- **Feature Type**: Enhancement / UI Architecture Refinement
- **Estimated Complexity**: Medium (Frontend Component Integration & State Sync)
- **Primary Systems Affected**: Frontend Admin Portal ([`AdminPage.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/pages/AdminPage.tsx)), [`StudentDetailsView.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/students/StudentDetailsView.tsx), [`UserDetailsView.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/admin/UserDetailsView.tsx)
- **Dependencies**: React 19, TanStack React Query 5, Material Design 3 Web Components (`@material/web`)

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING)

- [`frontend/src/pages/AdminPage.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/pages/AdminPage.tsx#L86-L105) (lines 86–105, 280–340) — Controls active page tab computation, details panel rendering, and view routing.
- [`frontend/src/components/students/StudentDetailsView.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/students/StudentDetailsView.tsx#L18-L56) (lines 18–56, 112–126) — Student details layout, tabs definition, query fetching for `/api/students/{id}`, and action footer placement.
- [`frontend/src/components/admin/UserDetailsView.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/admin/UserDetailsView.tsx#L16-L58) (lines 16–58, 126–165) — Status change logic (`handleStatusChange`), status badges, and account action buttons.
- [`frontend/src/hooks/useAdminUsers.ts`](file:///Volumes/Files/Programming/medical-system/frontend/src/hooks/useAdminUsers.ts#L13-L78) (lines 13–78) — Account status mutations (`updateStatus`, `deleteUser`) and cache invalidation.
- [`frontend/src/components/common/ActionFooter.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/ActionFooter.tsx#L1-L35) (lines 1–35) — Footer container supporting fullscreen portal anchoring and bottom-docked styling.
- [`frontend/src/components/common/Buttons.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/Buttons.tsx) & [`frontend/src/components/common/DestructiveButton.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/DestructiveButton.tsx) — MD3 button primitives.

### New Files to Create

- `frontend/src/components/admin/UserGovernanceFooter.tsx` — Account management action footer for admin details panels.
- `frontend/src/components/admin/UserGovernanceFooter.test.tsx` — Unit tests for the governance action footer states and handlers.
- `frontend/src/components/admin/AdminUserManagementDetails.test.tsx` — Integration tests asserting role-based details view switching and action triggers.

---

## Patterns to Follow

### 1. Action Footer Composition Pattern
From [`StudentDetailsView.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/students/StudentDetailsView.tsx#L112-L125) and [`ActionFooter.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/ActionFooter.tsx):
```tsx
<ActionFooter>
  <PrimaryButton
    icon="check_circle"
    label="通过审核并启用"
    onClick={handleApprove}
    disabled={isUpdating}
  />
  <DestructiveButton
    icon="person_remove"
    label="注销账号"
    onClick={handleDelete}
  />
</ActionFooter>
```

### 2. Details Panel Header & Tabs Dynamic Resolution
In [`AdminPage.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/pages/AdminPage.tsx):
```tsx
const isStudentUser = activePage === AdminTabs.USERS && selectedItem?.role === 'STUDENT';
const tabs = isStudentUser || activePage === AdminTabs.STUDENTS
  ? STUDENT_DETAILS_TABS
  : activePage === AdminTabs.USERS
  ? USER_DETAILS_TABS
  : activePage === AdminTabs.REFERRALS
  ? REFERRAL_DETAILS_TABS
  : [];
```

### 3. Student Entity Fallback for User Summary DTO
When passing an `AdminUserSummaryDto` to `StudentDetailsView`:
```tsx
const initialStudent: Partial<Student> = {
  id: selectedItem.id,
  name: selectedItem.name,
  major: selectedItem.departmentOrCollege,
  demographics: {
    studentId: selectedItem.employeeOrStudentId,
    email: selectedItem.email,
  } as any,
};
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation & Governance Footer Component
- Create [`UserGovernanceFooter.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/admin/UserGovernanceFooter.tsx) taking `user: AdminUserSummaryDto` and optional callback `onStatusUpdated?: (updatedStatus: AccountStatus) => void`.
- Integrate `useAdminUsers()` hook for `updateStatus` and `deleteUser`.
- Implement status-driven button variations:
  - `PENDING_APPROVAL`: `PrimaryButton` ("通过审核并启用", icon: `check_circle`) + `DestructiveButton` ("注销/拒绝", icon: `cancel`).
  - `ACTIVE`: `SecondaryButton` ("禁用账号", icon: `block`) + `DestructiveButton` ("注销账号", icon: `person_remove`).
  - `DISABLED`: `PrimaryButton` ("恢复账号", icon: `lock_open`) + `DestructiveButton` ("注销账号", icon: `person_remove`).
  - `DELETED`: `PrimaryButton` ("恢复账号", icon: `restore`).
  - Disable buttons if `user.role === 'SYSTEM_ADMIN'`.

### Phase 2: StudentDetailsView Extension
- Update [`StudentDetailsViewProps`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/students/StudentDetailsView.tsx) to add `footer?: React.ReactNode`.
- If `footer !== undefined`, pass `footer` to `ScrollableDetailsLayout`; if omitted, default to existing counseling action footer (`发起转诊` / `分配问卷`).

### Phase 3: AdminPage Integration
- Update `getTabsForPage()` to return `STUDENT_DETAILS_TABS` when `activePage === AdminTabs.USERS` and `selectedItem?.role === 'STUDENT'`.
- Update `DetailsPanel` title, subtitle, icon, and avatar for student user selection.
- Update `activePage === AdminTabs.USERS` branch in `DetailsPanel` children to render `<StudentDetailsView student={...} footer={<UserGovernanceFooter user={selectedItem} />} />` when `selectedItem?.role === 'STUDENT'`.
- Synchronize `selectedItem` state with the latest user query data so status updates immediately reflect in the footer and badges.

### Phase 4: Testing & Verification
- Unit test `UserGovernanceFooter.test.tsx` verifying each status state and callback invocation.
- Integration test in `AdminUserManagementDetails.test.tsx` verifying that selecting a student in `UserManagementView` displays `StudentDetailsView` tabs and the governance footer.
- Run `npm --prefix frontend run lint` and `npm --prefix frontend test`.

---

## STEP-BY-STEP TASKS

### Task 1: CREATE `frontend/src/components/admin/UserGovernanceFooter.tsx`
- **IMPLEMENT**: Action footer with account governance buttons based on `user.status` and `user.role`.
- **PATTERN**: Follow MD3 button styling and [`ActionFooter`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/ActionFooter.tsx).
- **IMPORTS**:
  ```tsx
  import React from 'react';
  import { AdminUserSummaryDto, AccountStatus } from '../../types/admin';
  import { useAdminUsers } from '../../hooks/useAdminUsers';
  import { ActionFooter } from '../common/ActionFooter';
  import { PrimaryButton, SecondaryButton } from '../common/Buttons';
  import { DestructiveButton } from '../common/DestructiveButton';
  ```
- **GOTCHA**: Do not allow deleting or disabling `SYSTEM_ADMIN` users. Handle async updating states (`isUpdating`) cleanly with disabled states.
- **VALIDATE**: `npm --prefix frontend run lint`

### Task 2: UPDATE `frontend/src/components/students/StudentDetailsView.tsx`
- **IMPLEMENT**: Add `footer?: React.ReactNode` to `StudentDetailsViewProps` and use it as `footer={footer !== undefined ? footer : (<ActionFooter>...</ActionFooter>)}`.
- **PATTERN**: [`StudentDetailsView.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/students/StudentDetailsView.tsx#L18-L45)
- **VALIDATE**: `npm --prefix frontend run lint`

### Task 3: UPDATE `frontend/src/pages/AdminPage.tsx`
- **IMPLEMENT**:
  - In `getTabsForPage()`: check if `activePage === AdminTabs.USERS && selectedItem?.role === 'STUDENT'`, returning `STUDENT_DETAILS_TABS`.
  - In `DetailsPanel` props: set `title`, `subtitle`, and `icon` appropriately for student users vs non-student users.
  - In `DetailsPanel` children: if `activePage === AdminTabs.USERS`:
    ```tsx
    selectedItem?.role === 'STUDENT' ? (
      <StudentDetailsView
        student={{
          id: selectedItem.id,
          name: selectedItem.name,
          major: selectedItem.departmentOrCollege || '',
          riskLevel: 'LOW',
          demographics: {
            studentId: selectedItem.employeeOrStudentId || '',
            email: selectedItem.email || '',
          } as any
        } as any}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        footer={<UserGovernanceFooter user={selectedItem} />}
      />
    ) : (
      <UserDetailsView user={selectedItem} activeTab={activeTab} />
    )
    ```
  - In `useEffect` / data syncing: sync `selectedItem` status if query data updates.
- **VALIDATE**: `npm --prefix frontend run lint`

### Task 4: CREATE `frontend/src/components/admin/UserGovernanceFooter.test.tsx`
- **IMPLEMENT**: Vitest tests covering:
  - Rendering "通过审核并启用" when status is `PENDING_APPROVAL`.
  - Rendering "禁用账号" and "注销账号" when status is `ACTIVE`.
  - Rendering "恢复账号" when status is `DISABLED`.
  - Rendering "恢复账号" when status is `DELETED`.
  - Triggering `updateStatus` and `deleteUser` on click.
- **VALIDATE**: `npx vitest run frontend/src/components/admin/UserGovernanceFooter.test.tsx`

### Task 5: CREATE `frontend/src/components/admin/AdminUserManagementDetails.test.tsx`
- **IMPLEMENT**: Vitest test asserting that:
  - Selecting a student in User Management renders `StudentDetailsView` tabs (`临床概览`, `量表数据`, `档案记录`).
  - Selecting a teacher/doctor in User Management renders `UserDetailsView` tabs (`基本信息`, `状态与权限`).
- **VALIDATE**: `npx vitest run frontend/src/components/admin/AdminUserManagementDetails.test.tsx`

---

## TESTING STRATEGY

### Unit Tests
- **`UserGovernanceFooter.test.tsx`**:
  - Test all 4 account statuses (`PENDING_APPROVAL`, `ACTIVE`, `DISABLED`, `DELETED`).
  - Test button disable conditions when mutations are pending or user is `SYSTEM_ADMIN`.
  - Assert correct status payload is dispatched to `updateAdminUserStatus` / `deleteAdminUser`.

### Integration Tests
- **`AdminUserManagementDetails.test.tsx`**:
  - Mount `AdminPage` with React Query and AuthContext.
  - Select a student row from the user management list.
  - Assert `StudentDetailsView` and clinical tabs are present in the DOM.
  - Assert `UserGovernanceFooter` buttons are rendered in place of student counseling buttons.
  - Select a non-student user and verify standard `UserDetailsView` is rendered.

---

## VALIDATION COMMANDS

### Level 1: Type Checking & Linting
```bash
npm --prefix frontend run lint
```

### Level 2: Unit & Component Tests
```bash
npx --prefix frontend vitest run frontend/src/components/admin/UserGovernanceFooter.test.tsx
npx --prefix frontend vitest run frontend/src/components/admin/AdminUserManagementDetails.test.tsx
```

### Level 3: Full Frontend Test Suite
```bash
npm --prefix frontend test -- --run
```

---

## ACCEPTANCE CRITERIA

- [ ] In Admin Portal -> User Management, selecting a student displays `StudentDetailsView` with tabs `临床概览`, `量表数据`, and `档案记录`.
- [ ] In Admin Portal -> User Management, selecting a teacher/doctor/admin displays `UserDetailsView` with tabs `基本信息` and `状态与权限`.
- [ ] When a student is selected in User Management, the action footer displays account governance buttons (`通过审核` / `禁用` / `恢复` / `注销`), NOT clinical actions (`发起转诊` / `分配问卷`).
- [ ] In Admin Portal -> Students tab, selecting a student continues to display clinical actions (`发起转诊` / `分配问卷`).
- [ ] Account status updates trigger query invalidations and update UI state reactively.
- [ ] TypeScript strict mode (`tsc --noEmit`) passes with 0 errors.
- [ ] All new and existing unit/integration tests pass.
