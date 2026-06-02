import * as React from 'react';

export type Role = 'student' | 'teacher' | 'head-councillor' | 'trial-admin';

export interface UserSession {
  role: Role;
  token: string;
}

interface AuthContextProps {
  session: UserSession;
  setRole: (role: Role) => void;
}

const AuthContext = React.createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<UserSession>({
    role: 'student',
    token: 'token_student_default'
  });

  const setRole = React.useCallback((role: Role) => {
    // Generate a mock token based on the role so the MSW backend can identify them
    let token = '';
    switch (role) {
      case 'teacher':
        token = 'mock_teacher_token_zhang';
        break;
      case 'head-councillor':
        token = 'mock_head_councillor_token_wang';
        break;
      case 'trial-admin':
        token = 'mock_trial_admin_token';
        break;
      case 'student':
      default:
        token = 'mock_student_token';
        break;
    }
    setSession({ role, token });
  }, []);

  return (
    <AuthContext.Provider value={{ session, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
