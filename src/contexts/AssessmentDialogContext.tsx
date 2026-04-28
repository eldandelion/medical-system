import * as React from 'react';
import { AssessmentDialog } from '../components/assessments/AssessmentDialog';

interface Assessment {
  id: string;
  title: string;
  assignedBy: {
    name: string;
    initial: string;
    bgColor?: string;
    textColor?: string;
  };
  type: string;
  completionPercentage: number;
  duration: string;
}

interface AssessmentDialogContextType {
  openAssessment: (assessment: Assessment) => void;
  closeAssessment: () => void;
}

const AssessmentDialogContext = React.createContext<AssessmentDialogContextType | undefined>(undefined);

export function AssessmentDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [selectedAssessment, setSelectedAssessment] = React.useState<Assessment | null>(null);

  const openAssessment = React.useCallback((assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setOpen(true);
  }, []);

  const closeAssessment = React.useCallback(() => {
    setOpen(false);
  }, []);

  const handleConfirm = React.useCallback(() => {
    if (selectedAssessment) {
      console.log(`Confirmed assessment: ${selectedAssessment.title}`);
    }
    setOpen(false);
  }, [selectedAssessment]);

  return (
    <AssessmentDialogContext.Provider value={{ openAssessment, closeAssessment }}>
      {children}
      <AssessmentDialog
        open={open}
        assessment={selectedAssessment}
        onClose={closeAssessment}
        onConfirm={handleConfirm}
      />
    </AssessmentDialogContext.Provider>
  );
}

export function useAssessmentDialog() {
  const context = React.useContext(AssessmentDialogContext);
  if (context === undefined) {
    throw new Error('useAssessmentDialog must be used within an AssessmentDialogProvider');
  }
  return context;
}
