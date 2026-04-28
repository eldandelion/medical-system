# GEMINI.md - Project Context Summary

## Project Overview
**Name**: University Medical Screening System (Frontend)
**Purpose**: A medical screening and referral management system for universities, supporting multiple user roles (Student, Teacher, Head Councillor).

## Technology Stack
- **Core**: [React 19](https://react.dev/) (Functional Components, Hooks)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**:
  - [Tailwind CSS 4](https://tailwindcss.com/)
  - [Material Design 3](https://m3.material.io/) via [Material Web Components](https://github.com/material-components/material-web)
  - Custom CSS variables for Material Design tokens (`var(--md-sys-color-*)`)
- **Icons**: [Material Symbols](https://fonts.google.com/icons) & [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/) (Framer Motion)
- **Charts**: [Recharts](https://recharts.org/)
- **AI**: [@google/genai](https://www.npmjs.com/package/@google/genai) for AI-driven features

## Architecture Pattern
- **Role-Based Orchestration**: The application uses a role-based navigation model. `App.tsx` switches between `StudentPage`, `TeacherPage`, and `HeadCouncillorPage`.
- **State Management**: 
  - **Local State**: React `useState` and `useReducer` within components.
  - **Global State**: React Context API (`ThemeContext`, `SidebarContext`, `CreationContext`).
- **Component Hierarchy**:
  - `pages/`: Orchestrate the overall layout and navigation for a specific user role.
  - `components/`: Domain-organized components (e.g., `records/`, `students/`, `layout/`).
  - `components/common/`: Atomic and reusable UI elements (e.g., `DataTable.tsx`, `DetailsPanel.tsx`, `GenericDialog.tsx`).
- **Theming**: Dynamic theme switching (Light/Dark/System) managed via `ThemeContext` and applied through CSS variables.

## Directory Structure
```text
/
├── src/
│   ├── components/       # UI components organized by domain/purpose
│   │   ├── layout/       # App shell: Sidebar, Header, NavItem, etc.
│   │   ├── common/       # Reusable UI: ActionComponents, DataTable, etc.
│   │   ├── dashboard/    # Dashboard-specific widgets
│   │   ├── records/      # RecordsView, ReferralManagement, etc.
│   │   ├── students/     # Student views and details
│   │   ├── staff/        # Staff management and details
│   │   ├── assessments/  # SelfAssessments, AssessmentCard
│   │   ├── profile/      # Profile views and details
│   │   ├── notifications/# NotificationsView, NotificationItem
│   │   ├── security/     # SecurityConsentView
│   │   └── creation-overlay/ # Specialized creation flow components
│   ├── contexts/         # React Context providers (Theme, Sidebar, etc.)
│   ├── pages/            # Role-specific entry point components
│   ├── types/            # TypeScript interfaces and shared types
│   ├── App.tsx           # Root component with role-based routing logic
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles and Material Design 3 token definitions
├── public/               # Static assets
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## Coding Conventions
- **Component Structure**: Always use Functional Components with Hooks.
- **Naming**:
  - Components: `PascalCase` (e.g., `ReferralDetailsView.tsx`)
  - Utilities/Functions: `camelCase`
  - Types/Interfaces: `PascalCase` (e.g., `HeaderProps`)
- **Styling**:
  - Prefer Material Design 3 tokens (`var(--md-sys-color-*)`) for colors and elevation.
  - Use Tailwind CSS for layout, spacing, and responsive design.
  - Utilize Material Web components (`<md-icon>`, `<md-button>`) for standard UI elements.
- **Type Safety**: Strictly define interfaces for all component props and state objects. Avoid `any` where possible (unless for specific demo/legacy hooks).
- **Organization**: Group related sub-components into folders (e.g., `creation-overlay`) or keep them in `components/` if they are shared across views.

