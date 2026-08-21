# Feature: Profile Personal Information Edit Sub-views (个人信息编辑子视图)

The following plan is complete and context-rich. Validate documentation, codebase patterns, and task sanity before implementing.

Pay special attention to naming of existing utils, types, M3 web components, and contexts (`useSnackbar`, `FullScreenView`, `PrimaryButton`, `SegmentedButton`, etc.).

---

## Feature Description

Implement full-fidelity Material Design 3 (Google Account style) edit sub-views for the **个人信息 (Personal Information)** FullScreenView. 

When a user clicks any item row in the personal information list (Avatar, Name, Gender, Email, Phone, Birthday, Address, Password), the view seamlessly transitions within the same `FullScreenView` to a dedicated sub-view (with the header `←` back arrow returning to the main list).

The sub-views replicate the exact layout, typography, input fields, privacy controls (segmented buttons), and informational callout cards from the UI templates in `.agents/ui_templates/` using Simplified Chinese (zh-CN) localization.

---

## User Story

```
As an authenticated user (Student, Teacher, Head Councillor, Trial Admin, Doctor, or Admin)
I want to click on any personal information item (such as Name, Gender, Birthday, or Password) in the 个人信息 screen to open a dedicated Material 3 sub-view
So that I can view detailed profile settings, configure visibility permissions (Only you vs. Anyone), update my credentials, and save changes with immediate visual feedback.
```

---

## Problem Statement

Currently, the `ProfileDetailsView` displays a static read-only list of profile properties (`ProfileListItem`). Clicking on a row does not open any editing or detail interface. Users lack an interactive, standardized way to update their names, gender preferences, birthday visibility, passwords, contact details, and addresses according to Material 3 / Google Account design guidelines.

---

## Solution Statement

1. **In-Place Sub-View Navigation State**:
   - Manage `currentView` in `ProfileDetailsView` (`null` for main list, `'name'`, `'name-edit'`, `'gender'`, `'birthday'`, `'password'`, `'email'`, `'phone'`, `'address'`, `'avatar'`).
   - Dynamic `FullScreenView` title (`个人信息`, `姓名`, `性别`, `生日`, `登录密码`, etc.) and smart `onClose` back-stack navigation.
2. **Dedicated Modular Sub-views in `frontend/src/components/profile/`**:
   - **`ProfileNameView.tsx`**: Overview cards (Name, Nickname, Legal Name) + Privacy callouts with people/shield icons + sub-edit form with First/Last name text fields (`姓` / `名`) and `取消` / `保存` actions (matching `Screenshot 2026-08-21 at 20.18.38.png` and `Screenshot 2026-08-21 at 20.19.03.png`).
   - **`ProfileGenderView.tsx`**: Personalization explanation header + Radio group (`女性`, `男性`, `不愿透露`) + `+ 添加自定义性别` + `SegmentedButton` visibility toggle (`🔒 仅限本人` vs `👥 任何人`) + privacy footnote (matching `Screenshot 2026-08-21 at 20.19.35.png`).
   - **`ProfileBirthdayView.tsx`**: Birthday date display row + `SegmentedButton` visibility toggle (`🔒 仅限本人` vs `👥 任何人`) + celebratory profile avatar decoration callout card (matching `Screenshot 2026-08-21 at 20.20.34.png`).
   - **`ProfilePasswordView.tsx`**: Security guidance banner + Outlined password inputs (`新密码`, `确认新密码`) with toggleable visibility eye icons (`visibility` / `visibility_off`) + password strength rules + `更改密码` pill button (matching `Screenshot 2026-08-21 at 20.21.21.png`).
   - **`ProfileContactView.tsx` & `ProfileAddressView.tsx` & `ProfileAvatarView.tsx`**: Matching M3 sub-views for Email, Phone, Home/Work Addresses, and Avatar selection.
3. **Live In-Memory State & Feedback**:
   - Centralize profile state in `ProfileDetailsView` so edits immediately update list values upon saving.
   - Display toast alerts via `useSnackbar` (`"姓名已更新"`, `"密码修改成功"`, etc.).

---

## Feature Metadata

- **Feature Type**: Enhancement / New UI Capability
- **Estimated Complexity**: Medium
- **Primary Systems Affected**: `frontend/src/components/profile/*`
- **Dependencies**: React 19, `@material/web`, `lucide-react` / `material-symbols`, `motion/react`

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING!)

- [`frontend/src/components/profile/ProfileDetailsView.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/profile/ProfileDetailsView.tsx) - Main container holding `FullScreenView` and profile list.
- [`frontend/src/components/profile/ProfileListItem.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/profile/ProfileListItem.tsx) - Row component with icon, title, value, and click handler.
- [`frontend/src/components/common/FullScreenView.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/FullScreenView.tsx) - Fullscreen container providing header, title, back arrow, and scrollable canvas.
- [`frontend/src/components/common/Buttons.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/Buttons.tsx) - Contains `PrimaryButton`, `SecondaryButton`, `TertiaryButton`, and `SegmentedButton`.
- [`frontend/src/contexts/SnackbarContext.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/contexts/SnackbarContext.tsx) - Provides `useSnackbar()` hook for toast notifications.
- [`.agents/ui_templates/`](file:///Volumes/Files/Programming/medical-system/.agents/ui_templates) - All 5 template screenshots.

### New Files to Create

- `frontend/src/components/profile/ProfileNameView.tsx` - Name overview and edit sub-view.
- `frontend/src/components/profile/ProfileGenderView.tsx` - Gender selection and visibility sub-view.
- `frontend/src/components/profile/ProfileBirthdayView.tsx` - Birthday and visibility sub-view with avatar decoration preview.
- `frontend/src/components/profile/ProfilePasswordView.tsx` - Password change sub-view with show/hide toggle and strength rules.
- `frontend/src/components/profile/ProfileContactView.tsx` - Email and Phone edit sub-views.
- `frontend/src/components/profile/ProfileAddressView.tsx` - Home, Work, and Other address edit sub-view.
- `frontend/src/components/profile/ProfileAvatarView.tsx` - Profile photo / avatar selection sub-view.
- `frontend/src/components/profile/ProfileSubViews.test.tsx` - Comprehensive unit tests for all sub-views.

---

## Patterns to Follow

### Sub-view Navigation Pattern
```tsx
type SubViewType = 'name' | 'name-edit' | 'gender' | 'birthday' | 'password' | 'email' | 'phone' | 'address' | 'avatar' | null;

const [activeSubView, setActiveSubView] = React.useState<SubViewType>(null);

const handleBack = () => {
  if (activeSubView === 'name-edit') {
    setActiveSubView('name');
  } else if (activeSubView !== null) {
    setActiveSubView(null);
  } else {
    onBack();
  }
};
```

### Material 3 Card Container Pattern
```tsx
<div className="bg-[var(--md-sys-color-surface)] rounded-3xl p-6 border border-[var(--md-sys-color-outline-variant)] space-y-6">
  {/* Card Content */}
</div>
```

### Visibility Segmented Button Pattern
```tsx
<SegmentedButton
  items={[
    { label: '仅限本人', value: 'private' },
    { label: '任何人', value: 'public' }
  ]}
  selectedValue={visibility}
  onChange={setVisibility}
/>
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation & Types
- Define profile state data models (`ProfileState` with name, firstName, lastName, nickname, legalName, gender, customGender, genderVisibility, birthday, birthdayVisibility, email, phone, homeAddress, workAddress, otherAddress, passwordLastChanged).
- Define sub-view route identifiers and event callbacks.

### Phase 2: Core Sub-View Components
- **Task 1**: Implement `ProfileNameView.tsx` supporting overview cards and edit mode with M3 text fields.
- **Task 2**: Implement `ProfileGenderView.tsx` with custom radio options and segmented visibility toggle.
- **Task 3**: Implement `ProfileBirthdayView.tsx` with birthday date row, privacy toggle, and avatar preview card.
- **Task 4**: Implement `ProfilePasswordView.tsx` with password inputs, visibility toggles, strength criteria, and change action.
- **Task 5**: Implement `ProfileContactView.tsx`, `ProfileAddressView.tsx`, and `ProfileAvatarView.tsx`.

### Phase 3: Integration into `ProfileDetailsView`
- Wire state and navigation router into `ProfileDetailsView.tsx`.
- Connect row click handlers in the main profile list to open corresponding sub-views.
- Connect save handlers to update in-memory state and trigger `useSnackbar()`.

### Phase 4: Testing & Verification
- Add comprehensive unit tests in `ProfileSubViews.test.tsx` and update `ProfileDetailsView.test.tsx`.
- Run typecheck (`tsc --noEmit`) and vitest suite.

---

## STEP-BY-STEP TASKS

### 1. CREATE `frontend/src/components/profile/ProfileNameView.tsx`
- **IMPLEMENT**: Name overview screen with chevrons on Name (`张伟` / `Daniil Petrov`), Nickname (`未设置昵称`), Legal Name (`John Smith`), plus privacy explanation cards with people/shield icons. Toggle into edit mode with First Name / Last Name inputs, `取消` and `保存` buttons.
- **PATTERN**: `frontend/src/components/profile/ProfileListItem.tsx`
- **VALIDATE**: `npm run lint`

### 2. CREATE `frontend/src/components/profile/ProfileGenderView.tsx`
- **IMPLEMENT**: Gender screen with description header, radio buttons (`女性`, `男性`, `不愿透露`), `+ 添加自定义性别` expandable input, `SegmentedButton` for `🔒 仅限本人` vs `👥 任何人`, and save on change.
- **PATTERN**: `frontend/src/components/common/Buttons.tsx:115` (`SegmentedButton`)
- **VALIDATE**: `npm run lint`

### 3. CREATE `frontend/src/components/profile/ProfileBirthdayView.tsx`
- **IMPLEMENT**: Birthday screen with date row (`2001年2月5日`), `SegmentedButton` for `🔒 仅限本人` vs `👥 任何人`, and celebratory avatar preview card.
- **VALIDATE**: `npm run lint`

### 4. CREATE `frontend/src/components/profile/ProfilePasswordView.tsx`
- **IMPLEMENT**: Password screen with advice notices, `新密码` and `确认新密码` fields with eye toggle icons, password strength hints, validation error handling, and `更改密码` action button.
- **VALIDATE**: `npm run lint`

### 5. CREATE `frontend/src/components/profile/ProfileContactView.tsx`, `ProfileAddressView.tsx`, `ProfileAvatarView.tsx`
- **IMPLEMENT**: Sub-views for Email, Phone, Addresses, and Avatar photo with M3 styled inputs and save actions.
- **VALIDATE**: `npm run lint`

### 6. UPDATE `frontend/src/components/profile/ProfileDetailsView.tsx`
- **IMPLEMENT**: Integrate sub-view switcher, dynamic `FullScreenView` title, back navigation stack, and live state management with `useSnackbar` feedback.
- **VALIDATE**: `npm run lint`

### 7. CREATE `frontend/src/components/profile/ProfileSubViews.test.tsx` & UPDATE `ProfileDetailsView.test.tsx`
- **IMPLEMENT**: Unit tests verifying navigation between main list and sub-views, form inputs, privacy toggle selection, password change validation, and toast notifications.
- **VALIDATE**: `npm test -- --run`

---

## TESTING STRATEGY

### Unit Tests
- Test each sub-view component in isolation (`ProfileNameView`, `ProfileGenderView`, `ProfileBirthdayView`, `ProfilePasswordView`, etc.).
- Verify input events, radio selections, segmented button toggles, and form submission callbacks.
- Verify password matching and minimum length validation.

### Integration Tests
- In `ProfileDetailsView.test.tsx`, test clicking list items to open sub-views and clicking header back arrow to return.
- Test that saving updates the displayed text in the main list.

---

## VALIDATION COMMANDS

- **Level 1 (Typecheck & Lint)**: `npm run lint` in `frontend/`
- **Level 2 (Unit & Integration Tests)**: `npm test -- --run` in `frontend/`

---

## ACCEPTANCE CRITERIA

- [ ] Clicking any item in `ProfileDetailsView` opens its corresponding M3 sub-view inside `FullScreenView`.
- [ ] Header title dynamically updates to match the active sub-view (e.g. `姓名`, `性别`, `生日`, `登录密码`).
- [ ] Header back arrow `←` navigates back to the main list (and back from sub-edit to overview).
- [ ] Name, Gender, Birthday, and Password sub-views accurately reproduce the layout, icons, and privacy controls in `.agents/ui_templates/`.
- [ ] Segmented buttons toggle privacy visibility (`仅限本人` vs `任何人`).
- [ ] Password form validates 8+ character length and matching confirmation before changing.
- [ ] Saving updates profile state and displays a success toast via `useSnackbar`.
- [ ] All tests pass (`npm test -- --run`) with 0 lint/TypeScript errors (`tsc --noEmit`).
