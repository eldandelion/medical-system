import React from 'react';
import { StudentPage } from './pages/StudentPage';
import { TeacherPage } from './pages/TeacherPage';
import { HeadCouncillorPage } from './pages/HeadCouncillorPage';
import { TrialAdminPage } from './pages/TrialAdminPage';
import { DoctorPage } from './pages/DoctorPage';
import { CreationOverlayProvider } from './contexts/CreationContext';
import { CreationRoot } from './components/creation-overlay/CreationRoot';
import { ThemeProvider } from './contexts/ThemeContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { session, setRole } = useAuth();
  const role = session.role;

  return (
    <ThemeProvider>
      <SnackbarProvider>
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
        ) : (
          <DoctorPage />
        )}
        
        {/* Role Switcher for Demo */}
        <div className="fixed bottom-4 left-4 z-[9999] flex gap-2 bg-[var(--md-sys-color-surface-container-highest)] p-2 rounded-full shadow-lg border border-[var(--md-sys-color-outline-variant)]">
          <button 
            onClick={() => setRole('student')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${role === 'student' ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)]'}`}
          >
            Student
          </button>
          <button 
            onClick={() => setRole('teacher')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${role === 'teacher' ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)]'}`}
          >
            Teacher
          </button>
          <button 
            onClick={() => setRole('head-councillor')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${role === 'head-councillor' ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)]'}`}
          >
            Head Councillor
          </button>
          <button 
            onClick={() => setRole('trial-admin')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${role === 'trial-admin' ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)]'}`}
          >
            Trial Admin
          </button>
          <button 
            onClick={() => setRole('doctor')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${role === 'doctor' ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)]'}`}
          >
            Doctor
          </button>
        </div>

        <CreationRoot />
      </div>
    </CreationOverlayProvider>
   </SnackbarProvider>
  </ThemeProvider>
  );
}
