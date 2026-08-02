# Frontend API & State Management Reference

## 1. API Client & Base URL Configuration

The application communicates with the Spring Boot backend (or MSW mock worker during development) using standard native `fetch` integrated with **TanStack React Query 5**.

### Base URL Construction
Because Vite applications can be deployed under subpaths, always construct endpoint URLs dynamically using `import.meta.env.BASE_URL`:

```ts
const getBaseUrl = (): string => {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

// Example URL formatting:
const url = `${getBaseUrl()}/api/students`;
// Or inline replacement pattern:
const url = `${import.meta.env.BASE_URL}/api/referrals`.replace('//api', '/api');
```

### Authentication Header Injection
Requests must include the Bearer token provided by `useAuth()`:

```ts
const { session } = useAuth();

const res = await fetch(`${getBaseUrl()}/api/resource`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${session.token}`,
    'Content-Type': 'application/json'
  }
});
```

### Global QueryClient Configuration
Defined in [queryClient.ts](file:///Volumes/Files/Programming/medical-system/frontend/src/utils/queryClient.ts):
- **Stale Time**: 5 minutes (`5 * 60 * 1000`)
- **Retries**: 3 attempts with exponential backoff
- **Window Focus Refetch**: Disabled (`refetchOnWindowFocus: false`)

---

## 2. Global State Handling: Contexts & Custom Hooks

Global state is partitioned into domain-specific React Contexts:

| Context / Hook | Purpose | Key Properties & Functions |
| :--- | :--- | :--- |
| **`AuthContext`**<br>`useAuth()` | Manages current user role & simulated JWT bearer token. | `session: { role, token }`<br>`setRole(role)` *(automatically invokes `queryClient.clear()`)* |
| **`SnackbarContext`**<br>`useSnackbar()` | Global alert toast notifications. | `showSnackbar({ message, duration?, actionLabel?, onAction? })`<br>`hideSnackbar()` |
| **`CreationContext`**<br>`useCreationOverlay()` | Manages bottom-docked & fullscreen creation sheets. | `viewState: 'CLOSED' \| 'MINIMIZED' \| 'STANDARD' \| 'FULLSCREEN'`<br>`openCreation(title, payload)`<br>`minimizeCreation()`<br>`expandToFullscreen()`<br>`closeCreation()` |
| **`DetailsContext`**<br>`useDetails()` | Supplies details pane state to nested child tabs. | `isFullScreen: boolean`<br>`titleOverride`, `setTitleOverride`<br>`tabsOverride`, `setTabsOverride` |
| **`SidebarContext`**<br>`useSidebar()` | Responsive sidebar collapse state. | `isCollapsed: boolean`, `toggleSidebar()` |
| **`ThemeContext`**<br>`useTheme()` | Light / Dark mode management. | `theme: 'light' \| 'dark'`, `toggleTheme()` |

### Custom Domain Hooks
- **`useReferralActions({ referralId, onUpdate })`**: Encapsulates workflow action mutations (approve, reject, assign doctor, schedule appointment, recall, delete) with dialog states, error extraction, and automatic `queryClient.invalidateQueries()`.
- **`useNotifications(token)`**: Handles notification queries, unread count polling, and mark-as-read mutations.
- **`useProfileSummary(token)`**: Fetches role-specific user profiles and headers for the active session.

---

## 3. TypeScript Type Mapping & API Contracts

All shared interfaces and DTOs are declared in [types/index.ts](file:///Volumes/Files/Programming/medical-system/frontend/src/types/index.ts) and domain API modules:

### Core Domain Entities
- **`Referral`**: Base referral aggregate (`id`, `studentName`, `type`, `riskLevel`, `status`, `availableActions`, `appointment`).
- **`ReferralDetails`**: Full clinical dossier containing `studentDemographics`, `triageInfo`, `riskAssessment`, and doctor `feedback`.
- **`Student`**: Demographics, academic affiliation, `riskLevel`, dynamic `riskFlags`, and historical test scores.
- **`NotificationDto`**: In-app alerts (`id`, `messageCode`, `payload`, `actionType`, `isActionAvailable`, `isRead`).

### Client-Side Enrichment Utilities
Backend DTOs are enriched for UI presentation via helper utilities in `src/utils/`:
- **`enrichReferralStatus(referral)`**: Computes `displayStatus`, human-readable status labels, and allowed `availableActions` based on the user's role and referral progression step.

---

## 4. Error Handling & Loading State Patterns

### Fetch Error Handling Strategy
API calls check `res.ok` and parse backend validation/error payloads:

```ts
if (!res.ok) {
  let errorMessage = 'Request failed';
  try {
    const errorData = await res.json();
    if (errorData.message) errorMessage = errorData.message;
    else if (errorData.error && errorData.details) {
      errorMessage = Object.values(errorData.details).join(', ');
    } else if (typeof errorData === 'string') {
      errorMessage = errorData;
    }
  } catch (e) {
    // Non-JSON error payload
  }
  throw new Error(errorMessage);
}
```

### UI Loading Pattern
Always render Material Web circular progress indicators centered during initial query fetch:

```tsx
{isLoading && data.length === 0 ? (
  <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
    {/* @ts-ignore */}
    <md-circular-progress indeterminate></md-circular-progress>
    <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] mt-4">正在加载...</span>
  </div>
) : isError ? (
  <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] text-[var(--md-sys-color-error)]">
    <span className="material-symbols-outlined text-[48px]">error</span>
    <span className="text-[14px] mt-2">数据加载失败: {error.message}</span>
  </div>
) : data.length === 0 ? (
  <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] text-[var(--md-sys-color-on-surface-variant)]">
    <span className="material-symbols-outlined text-[48px] opacity-50">inbox</span>
    <span className="text-[14px] mt-2">暂无数据</span>
  </div>
) : (
  <DataTable columns={columns} data={data} onRowClick={onSelect} />
)}
```

---

## 5. Recipe: Fetching, Storing, and Displaying Data in a New Component

When implementing a new view or component, follow this pattern:

```tsx
import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { DataTable, ColumnDefinition } from '../common/DataTable';
import { PrimaryButton } from '../common/Buttons';

interface ItemType {
  id: string;
  name: string;
  status: string;
}

export function SampleDataView({ onSelect, selectedId }: { onSelect?: (item: ItemType) => void; selectedId?: string }) {
  const { session } = useAuth();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // 1. Fetching Data with TanStack Query
  const { data, isLoading, isError, error } = useQuery<ItemType[]>({
    queryKey: ['/api/items', session.token],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/items`.replace('//api', '/api'), {
        headers: { 'Authorization': `Bearer ${session.token}` }
      });
      if (!res.ok) throw new Error('Failed to load items');
      return res.json();
    },
    enabled: !!session.token
  });

  // 2. Mutation with Toast Feedback & Query Invalidation
  const mutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/items/${itemId}/action`.replace('//api', '/api'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.token}` }
      });
      if (!res.ok) throw new Error('Action failed');
      return res.json();
    },
    onSuccess: () => {
      showSnackbar({ message: '操作成功', duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
    },
    onError: (err: Error) => {
      showSnackbar({ message: `操作失败: ${err.message}`, duration: 5000 });
    }
  });

  // 3. Define Table Columns
  const columns: ColumnDefinition<ItemType>[] = [
    { key: 'name', label: '名称', width: 'w-[60%]' },
    { key: 'status', label: '状态', width: 'flex-1' },
    {
      key: 'actions',
      label: '操作',
      width: 'w-[100px]',
      render: (item) => (
        <PrimaryButton 
          label="执行" 
          noCollapse 
          onClick={() => mutation.mutate(item.id)} 
        />
      )
    }
  ];

  // 4. Render Loading, Empty, or Data Views
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        {/* @ts-ignore */}
        <md-circular-progress indeterminate></md-circular-progress>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col pt-4">
      <DataTable 
        columns={columns} 
        data={data || []} 
        onRowClick={onSelect} 
        selectedId={selectedId} 
      />
    </div>
  );
}
```
