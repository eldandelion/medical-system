# Feature: Responsive Canvas Overlay Mode for DetailsPanel on Narrow Screens

The following plan is complete, context-rich, and ready for one-pass execution. Validate all references, types, and imports before executing.

---

## Feature Description

When viewport width drops below `1024px`, opening a details panel (`DetailsPanel` in `MainContent`) will switch from a side-by-side split layout to an **in-canvas overlay mode**. The details view will expand to 100% width of the main canvas area (`<main>`), covering the underlying list view and filter chips, while keeping the top application header and left navigation sidebar visible and interactive.

---

## User Story

```
As a Teacher, Counselor, Admin, or Doctor using a tablet, laptop, or resized browser window (< 1024px)
I want the details view to overlay the main list canvas at 100% width when opened
So that both the list and the details panel maintain full readability and utility without getting squeezed into unreadable slivers
```

---

## Problem Statement

Currently, `MainContent.tsx` always mounts the `sidePanel` side-by-side with the `<main>` canvas. On viewports below `1024px` (or when the window is narrow), allocating 440px–480px to the side panel compresses the main list canvas down to 300px–400px. As a result, both the data table/list and the details panel suffer severe horizontal cramping, clipped table columns, and suboptimal user experience.

---

## Solution Statement

1. Define a responsive overlay breakpoint token `RESPONSIVE_OVERLAY_BREAKPOINT: 1024` in `layoutConstants.ts`.
2. Implement a reusable, SSR-safe `useMediaQuery` hook (`frontend/src/hooks/useMediaQuery.ts`) that listens to `(max-width: 1023px)`.
3. In `MainContent.tsx`:
   - Detect overlay mode via `useMediaQuery`.
   - When `isOverlayMode` is `true` and `showSide` is `true`:
     - Hide the horizontal drag-resize handle.
     - Render the side panel container as an absolute overlay (`absolute inset-0 z-30 w-full h-full`) over the `<main>` canvas with `@container` scoping.
     - Pass `width="100%"` (or `w-full`) to `DetailsPanel`.
   - When `isOverlayMode` is `false`:
     - Render the standard side-by-side split layout with the drag-resize handle and numeric pixel width (`sideWidth`).
4. In `DetailsPanel.tsx`:
   - Support `width?: number | string` (accepting `'100%'` or numeric pixel values), ensuring `style={{ width: typeof width === 'number' ? `${width}px` : width }}` works seamlessly in both split and overlay modes.
5. In unit tests and browser tests:
   - Provide comprehensive unit tests for `useMediaQuery` and `MainContent` overlay transitions.
   - Verify visual rendering via browser automation.

---

## Feature Metadata

- **Feature Type**: Enhancement / Responsive UX Architecture
- **Estimated Complexity**: Low to Medium
- **Primary Systems Affected**:
  - `frontend/src/config/layoutConstants.ts`
  - `frontend/src/hooks/useMediaQuery.ts` (New)
  - `frontend/src/components/layout/MainContent.tsx`
  - `frontend/src/components/common/DetailsPanel.tsx`
- **Dependencies**: React 19, Motion (`motion/react`), Tailwind CSS 4

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING)

- [`frontend/src/components/layout/MainContent.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/layout/MainContent.tsx#L1-L88)
  - *Why*: Manages `<main>` canvas, resizer handle, and `#side-panel-wrapper`. This is the primary component hosting split vs overlay rendering.
- [`frontend/src/components/common/DetailsPanel.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/DetailsPanel.tsx#L20-L65)
  - *Why*: Defines `DetailsPanelProps`, `width` prop, and `motion.aside` wrapper with `style={{ width }}`.
- [`frontend/src/config/layoutConstants.ts`](file:///Volumes/Files/Programming/medical-system/frontend/src/config/layoutConstants.ts#L1-L8)
  - *Why*: Central repository for layout sizing tokens (`SIDE_PANEL_DEFAULT_WIDTH`, `SIDE_PANEL_MIN_WIDTH`, etc.).
- [`frontend/src/contexts/ThemeContext.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/contexts/ThemeContext.tsx#L20-L40)
  - *Why*: Shows existing `window.matchMedia` usage pattern in the project.

### New Files to Create

- `frontend/src/hooks/useMediaQuery.ts`
  - *Why*: Standard React hook for media query matching with clean event listener subscription and fallback for testing environments.
- `frontend/src/hooks/__tests__/useMediaQuery.test.ts`
  - *Why*: Unit tests verifying match state and listener updates.

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation (Tokens & Media Query Hook)
- Add `RESPONSIVE_OVERLAY_BREAKPOINT = 1024` to `layoutConstants.ts`.
- Create `frontend/src/hooks/useMediaQuery.ts` with test environment resilience.

### Phase 2: Core Layout Updates
- Update `DetailsPanel.tsx` to accept `width?: number | string`.
- Update `MainContent.tsx` to conditionally toggle between:
  - **Split View** (width >= 1024px): Side-by-side flex layout with drag resizer.
  - **Overlay View** (width < 1024px): Full-canvas absolute overlay on top of `<main>`, hiding drag resizer, passing `width="100%"` to child panel.

### Phase 3: Testing & Validation
- Unit tests for `useMediaQuery` and `MainContent` overlay logic.
- Type check via `npm --prefix frontend run lint`.
- Vitest suite validation via `npx vitest run`.
- Browser visual verification via `agent-browser` simulating <1024px viewports.

---

## STEP-BY-STEP TASKS

### Task 1: Check Out Feature Branch
- **ACTION**: Switch to feature branch `feat/responsive-details-overlay`.
- **VALIDATE**: `git branch --show-current`

---

### Task 2: ADD Breakpoint Constant in `layoutConstants.ts`
- **FILE**: `frontend/src/config/layoutConstants.ts`
- **IMPLEMENT**: Add `RESPONSIVE_OVERLAY_BREAKPOINT: 1024` to `LAYOUT_CONSTANTS`.
- **CODE**:
  ```ts
  export const LAYOUT_CONSTANTS = {
    SIDE_PANEL_WRAPPER_ID: 'side-panel-wrapper',
    SIDE_PANEL_MIN_WIDTH: 440,
    SIDE_PANEL_DEFAULT_WIDTH: 480,
    SIDE_PANEL_MAX_WIDTH: 800,
    RESPONSIVE_OVERLAY_BREAKPOINT: 1024,
    ACTION_FOOTER_CLASS: 'action-footer-content-wrapper',
    TABS_LIST_CLASS: 'details-tabs-list',
  } as const;
  ```
- **VALIDATE**: `npm --prefix frontend run lint`

---

### Task 3: CREATE `useMediaQuery` Hook
- **FILE**: `frontend/src/hooks/useMediaQuery.ts`
- **IMPLEMENT**: Custom React hook wrapping `window.matchMedia`.
- **CODE**:
  ```ts
  import { useState, useEffect } from 'react';

  export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(() => {
      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        return window.matchMedia(query).matches;
      }
      return false;
    });

    useEffect(() => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return;
      }

      const mediaQuery = window.matchMedia(query);
      setMatches(mediaQuery.matches);

      const handler = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler);
      } else {
        mediaQuery.addListener(handler);
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handler);
        } else {
          mediaQuery.removeListener(handler);
        }
      };
    }, [query]);

    return matches;
  }
  ```
- **VALIDATE**: `npm --prefix frontend run lint`

---

### Task 4: CREATE Unit Test for `useMediaQuery`
- **FILE**: `frontend/src/hooks/__tests__/useMediaQuery.test.ts`
- **IMPLEMENT**: Test matches state initialization and media query event dispatching.
- **VALIDATE**: `npx --prefix frontend vitest run src/hooks/__tests__/useMediaQuery.test.ts`

---

### Task 5: UPDATE `DetailsPanel.tsx` for Flexible Width Type
- **FILE**: `frontend/src/components/common/DetailsPanel.tsx`
- **IMPLEMENT**:
  - Change `width?: number` to `width?: number | string`.
  - In `motion.aside`, update style to `style={{ width: typeof width === 'number' ? `${width}px` : width }}`.
- **VALIDATE**: `npm --prefix frontend run lint`

---

### Task 6: REFACTOR `MainContent.tsx` with Overlay Mode
- **FILE**: `frontend/src/components/layout/MainContent.tsx`
- **IMPLEMENT**:
  - Import `useMediaQuery` from `../../hooks/useMediaQuery`.
  - Import `LAYOUT_CONSTANTS` from `../../config/layoutConstants`.
  - Compute `isOverlay = useMediaQuery(`(max-width: ${LAYOUT_CONSTANTS.RESPONSIVE_OVERLAY_BREAKPOINT - 1}px)`);`.
  - When `isOverlay` is true:
    - Main container renders `{children}`.
    - When `showSide` is true:
      - Resizer is NOT rendered.
      - Render `#side-panel-wrapper` as an absolute overlay within `main`:
        `<div id={LAYOUT_CONSTANTS.SIDE_PANEL_WRAPPER_ID} className="@container absolute inset-0 z-30 w-full h-full overflow-hidden flex flex-col">`
      - Pass `width="100%"` into `sidePanel`.
  - When `isOverlay` is false:
    - Render standard side-by-side flex layout with resizer and numeric `sideWidth`.
- **VALIDATE**: `npm --prefix frontend run lint`

---

### Task 7: Run Full Validation Suite
- **VALIDATE**:
  - `npm --prefix frontend run lint`
  - `npx --prefix frontend vitest run src/components/common/DetailsPanel.test.tsx src/hooks/__tests__/useMediaQuery.test.ts`

---

### Task 8: Browser Visual Validation
- **ACTION**:
  - Launch `agent-browser open http://localhost:3000/medical-system/`.
  - Set viewport width to `800px` (e.g. `agent-browser set-viewport 800 900`).
  - Switch to `Teacher` role -> `转诊管理` -> click a referral.
  - Assert the details panel completely covers the main canvas (100% canvas width).
  - Verify the left sidebar navigation and top search bar remain intact and clickable.
  - Click `X` to close details panel; assert the referral list reappears immediately.
  - Set viewport back to `1280px`; assert side-by-side split layout restores cleanly.

---

## ACCEPTANCE CRITERIA

- [ ] `RESPONSIVE_OVERLAY_BREAKPOINT` token cleanly configured at `1024`.
- [ ] On viewports `< 1024px`, opening a details panel overlays 100% of the canvas.
- [ ] The left navigation sidebar and top header are never covered or obscured.
- [ ] The drag-resizer handle is hidden when in overlay mode.
- [ ] Closing the details panel in overlay mode immediately reveals the list view.
- [ ] On viewports `>= 1024px`, side-by-side split view with resizer is preserved.
- [ ] All linting, TypeScript compilation, and unit tests pass with zero errors.
