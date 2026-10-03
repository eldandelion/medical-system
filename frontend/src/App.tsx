import React from 'react';
import { StudentPage } from './pages/StudentPage';
import { TeacherPage } from './pages/TeacherPage';
import { HeadCouncillorPage } from './pages/HeadCouncillorPage';
import { TrialAdminPage } from './pages/TrialAdminPage';
import { DoctorPage } from './pages/DoctorPage';
import { AdminPage } from './pages/AdminPage';
import { CreationOverlayProvider } from './contexts/CreationContext';
import { CreationRoot } from './components/creation-overlay/CreationRoot';
import { ThemeProvider } from './contexts/ThemeContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { GlobalSearchProvider } from './contexts/GlobalSearchContext';
import { CommandPalette } from './components/search/CommandPalette';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { session } = useAuth();
  const role = session.role;

  return (
    <ThemeProvider>
      <SnackbarProvider>
        <NavigationProvider>
          <GlobalSearchProvider>
            <CreationOverlayProvider>
              <div className="relative w-full h-full">
                {role === 'student' ? (
                  <StudentPage />
                ) : role === 'teacher' ? (
                  <TeacherPage />
                ) : role === 'head-councillor' ? (
                  <HeadCouncillorPage />
                ) : role === 'trial-admin' ? (
                  <TrialAdminPage />
                ) : role === 'doctor' ? (
                  <DoctorPage />
                ) : (
                  <AdminPage />
                )}

                <CreationRoot />
                <CommandPalette />
              </div>
            </CreationOverlayProvider>
          </GlobalSearchProvider>
        </NavigationProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
