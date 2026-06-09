# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commonly Used Commands

- **Install dependencies:** `npm install`
- **Start development server:** `npm run dev` (Runs on port 3000, accessible via IP)
- **Type-check / Lint:** `npm run lint` (Runs `tsc --noEmit`)
- **Build for production:** `npm run build`
- **Preview production build:** `npm run preview`

*(Note: There is currently no test runner configured in this repository.)*

## High-Level Architecture & Structure

This is a Vite + React 19 single-page application heavily relying on modern web standards and styling solutions.

**Core Tech Stack**
- **Framework:** React 19 with Vite.
- **Styling:** Tailwind CSS v4 and Material Web Components (`@material/web` custom elements).
- **API Mocking:** MSW (Mock Service Worker) is used to intercept and mock API requests.

**Project Structure Highlights**
- `src/main.tsx`: Application entry point. Bootstraps the React app, registers Material Web custom elements, and conditionally starts the MSW worker in development mode.
- `src/App.tsx`: The primary shell of the application. It acts as a role-based router, rendering completely different page views (`StudentPage`, `TeacherPage`, `HeadCouncillorPage`, `TrialAdminPage`) depending on the current user's role from the `AuthContext` session. Includes a floating action widget for rapid role-switching during development/demos.
- `src/contexts/`: Centralized state management using React Context.
  - `AuthContext`: Manages current user session and role.
  - `CreationContext`: Manages an application-wide overlay for creating items.
  - `ThemeContext` & `SnackbarContext`: Application-wide UI states.
- `src/mocks/`: Contains the MSW handlers for local API mocking.
- `src/pages/`: Top-level route components representing the distinct dashboards for each user archetype.
- `src/components/`: Reusable React components. `src/components/creation-overlay/CreationRoot` is globally mounted in `App.tsx` handling the app's floating creation flow.