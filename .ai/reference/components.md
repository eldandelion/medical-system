# Frontend UI Architecture & Component Reference

## 1. Component Structure & Directory Conventions

The frontend follows a domain-driven, role-orchestrated component hierarchy:

```text
frontend/src/
├── pages/                  # Role-based root orchestrators (Student, Teacher, HeadCouncillor, TrialAdmin, Doctor)
├── components/
│   ├── layout/             # Shell scaffolding (Header, Sidebar, MainContent, NavItem, CanvasHeader)
│   ├── common/             # Domain-agnostic reusable UI primitives (Buttons, DataTable, DetailsPanel, etc.)
│   ├── creation-overlay/   # Global slide-up creation sheet & dock system (CreationRoot, CreationSheetTemplate)
│   ├── dashboard/          # Caseload analytics, KPI cards, and calendar widgets
│   ├── records/            # Referral management, timeline trackers, and doctor feedback forms
│   ├── students/           # Student directory, health profiles, and risk level indicators
│   ├── assessments/        # Psychometric questionnaires and test score charts
│   ├── staff/              # Counselor/Doctor directories and caseload allocation
│   ├── notifications/      # Real-time alerts and urgent triage banners
│   ├── profile/            # User profile summaries and session settings
│   └── security/           # Privacy consent and compliance views
├── contexts/               # Context providers (Auth, Sidebar, Details, Creation, Theme, Snackbar)
├── hooks/                  # Custom query and domain hooks (useReferralActions, useNotifications, etc.)
├── config/                 # UI constants, design tokens, style maps, and layout constants
└── types/                  # TypeScript interface definitions and Material Web JSX augmentations
```

### Conventions for New Pages & Views
1. **Page Orchestrators (`src/pages/`)**: Host role-level state (`activePage`, `selectedItem`, `activeTab`), initiate root TanStack queries, configure sidebar navigation items, and render `MainContent` with optional side panels.
2. **Domain Views (`src/components/<domain>/<Name>View.tsx`)**: Standalone views rendering data lists or dashboards. Accept selection callbacks (`onSelect`, `selectedId`) and optional `header` render props.
3. **Detail Panels (`src/components/<domain>/<Name>DetailsView.tsx`)**: Sub-components designed to be hosted inside `DetailsPanel` or `FullScreenView`. Consume `DetailsContext` when adjusting titles or tab structures dynamically.

---

## 2. Styling Patterns, Material Design 3, & CSS Guidelines

### Tailwind CSS 4 & Preflight Isolation
- Material Web custom elements (`md-*`) are isolated from Tailwind's preflight resets via `@layer base { :is(md-*) { all: revert-layer; } }` in [index.css](file:///Volumes/Files/Programming/medical-system/frontend/src/index.css).
- Tailwind utilities remain fully applicable to custom elements via `className`.

### MD3 System Color Tokens
Never use hardcoded hex or arbitrary colors for UI elements. Always bind to Material Design 3 CSS custom properties:

```tsx
// Surface & Backgrounds
className="bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]"
className="bg-[var(--md-sys-color-surface-container)] border-[var(--md-sys-color-outline-variant)]"

// Tonal Containers & Highlights
className="bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
className="bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
className="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
```

### Centralized Style Maps
Domain statuses and risk badges must reference centralized style maps in [styleConstants.ts](file:///Volumes/Files/Programming/medical-system/frontend/src/config/styleConstants.ts):
- `STATUS_STYLES[status]` & `STATUS_LABELS[status]` for referral states.
- `RISK_LEVEL_STYLES[level]` & `RISK_LEVEL_LABELS[level]` for student risk tags.

### Material Symbols & Icons
- Use Material Symbols Outlined: `<span className="material-symbols-outlined">icon_name</span>` or `<md-icon slot="icon">icon_name</md-icon>`.
- For filled icons, use inline style `fontVariationSettings: "'FILL' 1"` or the `.filled-icon` helper class.

---

## 3. Layout Patterns Across Main Views

### Master-Detail Layout (`MainContent` + `DetailsPanel`)
All entity lists (Students, Records, Staff) use the resizable split-view pattern:

```tsx
<MainContent
  isSidePanelOpen={!!selectedItem}
  sidePanel={
    <DetailsPanel
      isOpen={!!selectedItem}
      onClose={() => setSelectedItem(null)}
      title={selectedItem?.name || ''}
      icon="account_circle"
      tabs={DETAIL_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <EntityDetailsView item={selectedItem} activeTab={activeTab} />
    </DetailsPanel>
  }
>
  <EntityView onSelect={setSelectedItem} selectedId={selectedItem?.id} />
</MainContent>
```

- **Resizable Divider**: `MainContent` manages horizontal dragging, respecting dynamic minimum widths defined by `LAYOUT_CONSTANTS`.
- **Surface Elevation**: Main views sit inside a rounded surface container (`rounded-3xl bg-[var(--md-sys-color-surface)]`).

### Fullscreen Expansion (`FullScreenView`)
`DetailsPanel` includes a built-in expand button triggering `FullScreenView`:
- Renders a top app bar with `arrow_back`, title, subtitle, avatar, action buttons, and optional progress indicator.
- Houses tab-based left sub-navigation (`w-72`) alongside a centered max-width content container (`max-w-4xl`).

### Bottom Creation Sheet Overlay (`CreationContext`)
Multi-step forms (such as new referrals or assignments) use the overlay system:
- Opened via `useCreationOverlay().openCreation({ title, payload, headerActions })`.
- Animates from bottom as a modal sheet (`h-[75dvh] max-w-4xl`), collapsible to a bottom dock, or expandable to full screen.

---

## 4. Rules for Reusable Common Components (`src/components/common/`)

| Component | File Path | Usage & Rules |
| :--- | :--- | :--- |
| **`PrimaryButton` / `SecondaryButton` / `TertiaryButton`** | [Buttons.tsx](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/Buttons.tsx) | Wrap `<md-filled-button>`, `<md-outlined-button>`, and `<md-text-button>`. Auto-collapse to icon-only when sidebar collapses unless `noCollapse` is true. Blur on pointer-up. |
| **`TertiaryFab`** | [Buttons.tsx](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/Buttons.tsx) | Used in sidebars or canvas headers for primary creation actions (`+ 新建转诊`). |
| **`SegmentedButton`** | [Buttons.tsx](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/Buttons.tsx) | Tonal segmented filter buttons with checkmark state layer. |
| **`DataTable<T>`** | [DataTable.tsx](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/DataTable.tsx) | Generic table. Columns require `key`, `label`, optional `width` (e.g. `w-[30%]`, `flex-1`), and custom `render(item, isSelected)`. Auto-highlights `selectedId`. |
| **`DetailsPanel`** | [DetailsPanel.tsx](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/DetailsPanel.tsx) | Standard right-hand slide-in panel. Houses header actions (expand, close) and supplies `DetailsContext`. |
| **`FullScreenView`** | [FullScreenView.tsx](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/FullScreenView.tsx) | Fixed modal overlay with standardized header, left navigation sidebar, and centered content. |
| **`FilterChip` / `FilterChipSet`** | [FilterChip.tsx](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/FilterChip.tsx) | Dropdown filter chips wrapping `<md-menu>` and `<md-menu-item>`. Always strip colons from generated HTML IDs (`useId().replace(/:/g, '')`). |
| **`PrimaryTabs`** | [Tabs.tsx](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/Tabs.tsx) | Native MD3 `<md-tabs>` with `<md-primary-tab>`. Controlled via `activeTab` string and `onTabChange(id)`. |
| **`GenericDialog`** | [GenericDialog.tsx](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/GenericDialog.tsx) | Simple confirmation/alert dialogs with title, text, cancel/confirm actions. |
| **`Snackbar`** | [Snackbar.tsx](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/Snackbar.tsx) | Global alert notification bar triggered via `useSnackbar()` hook. |
| **`ActionFooter`** | [ActionFooter.tsx](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/ActionFooter.tsx) | Fixed bottom action strip inside side panels or full-screen views. Must use `LAYOUT_CONSTANTS.ACTION_FOOTER_CLASS`. |
| **`DoctorScheduleCalendar`** | [DoctorScheduleCalendar.tsx](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/DoctorScheduleCalendar.tsx) | Weekly appointment calendar view with slot selection and status indicators. |
