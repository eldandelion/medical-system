import * as React from 'react';
import { AssessmentDialog } from '../components/assessments/AssessmentDialog';
import { AssessmentFlow } from '../components/assessments/AssessmentFlow';
import { MENTAL_HEALTH_ASSESSMENT, SLEEP_ASSESSMENT, DIGITAL_HABITS_DAILY_BEHAVIORS_ASSESSMENT } from '../components/assessments/AssessmentData';


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
    if (assessment.completionPercentage < 100) {
      setIsFullScreenOpen(true);
    } else {
      setOpen(true);
    }
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
      <AssessmentFlow
        isOpen={isFullScreenOpen}
        onClose={() => setIsFullScreenOpen(false)}
        assessmentId={selectedAssessment?.id || ''}
        assessmentTitle={selectedAssessment?.title || ''}
        assessmentSubtitle={
          selectedAssessment?.id === 'sleep'
            ? '最近1个月的睡眠与失眠状况调查'
            : selectedAssessment?.id === 'digital_habits'
              ? '数字化习惯与日常行为状况综合评估'
              : '2025-2026 学年学生心理健康普查'
        }
        sections={
          selectedAssessment?.id === 'sleep'
            ? SLEEP_ASSESSMENT
            : selectedAssessment?.id === 'digital_habits'
              ? DIGITAL_HABITS_DAILY_BEHAVIORS_ASSESSMENT
              : MENTAL_HEALTH_ASSESSMENT
        }
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
