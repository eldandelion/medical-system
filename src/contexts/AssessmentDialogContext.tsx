import * as React from 'react';
import { AssessmentDialog } from '../components/assessments/AssessmentDialog';
import { FullScreenView } from '../components/common/FullScreenView';


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
  const [isFullScreenOpen, setIsFullScreenOpen] = React.useState(false);

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
      setIsFullScreenOpen(true);
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
      <FullScreenView
        isOpen={isFullScreenOpen}
        onClose={() => setIsFullScreenOpen(false)}
        title={selectedAssessment?.title || ''}
      >
        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
          {/* Content will be added here later */}
        </div>
      </FullScreenView>
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
