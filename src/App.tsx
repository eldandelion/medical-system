import React, { useState } from 'react';
import { StudentPage } from './pages/StudentPage';
import { TeacherPage } from './pages/TeacherPage';
import { HeadCouncillorPage } from './pages/HeadCouncillorPage';
import { CreationOverlayProvider } from './contexts/CreationContext';
import { CreationRoot } from './components/creation-overlay/CreationRoot';
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  const [role, setRole] = useState<'student' | 'teacher' | 'head-councillor'>('student');

  return (
    <ThemeProvider>
      <CreationOverlayProvider>
        <div className="relative w-full h-full">
        {role === 'student' ? (
          <StudentPage />
        ) : role === 'teacher' ? (
          <TeacherPage />
        ) : (
          <HeadCouncillorPage />
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
        </div>

        <CreationRoot />
      </div>
    </CreationOverlayProvider>
   </ThemeProvider>
  );
}
