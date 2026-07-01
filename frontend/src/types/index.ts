export type ReferralStepStatus = 'completed' | 'issue' | 'pending' | 'active';
export type ReferralStepType = 'initiation' | 'review' | 'triage' | 'scheduling' | 'evaluation' | 'feedback';

export type ClinicalStatusType = 'FirstVisit' | 'Medicated' | 'PriorTherapy';
export type SevereRiskFactorType = 'Ideation' | 'Attempt' | 'SelfHarm';

export interface ReferralStep {
  id: string | number;
  type: ReferralStepType;
  title: string;
  subtitle: string;
  time: string;
  status: ReferralStepStatus;
}

export type ReferralAction = 
  | 'recreate'
  | 'delete_draft'
  | 'approve_referral'
  | 'reject_referral'
  | 'recall_referral'
  | 'assign_doctor'
  | 'schedule_appointment'
  | 'write_feedback'
  | 'report_problem'
  | 'acknowledge_feedback'
  | 'reassign_doctor';

export interface Referral {
  id: string;
  studentName: string;
  studentNumber: string;
  type: '初次转诊' | '复诊转诊' | '紧急转诊' | string;
  date: string;
  title: string;
  description: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  status: 'Draft' | 'Closed' | 'AwaitingTriage' | 'AwaitingApproval' | 'Recalled' | 'AwaitingFeedbackApproval' | 'Error' | 'Rejected' | 'WaitingForScheduling' | 'WaitingForAppointment';
  displayStatus?: string;
  availableActions?: ReferralAction[];
  referredBy?: {
    name: string;
    avatar?: string;
  };
  extendedData?: {
    age: number;
    gender: string;
    studentId: string;
    school: string;
    grade: string;
    phone: string;
    triage: {
      isFirstVisit: boolean;
      isMedicated: boolean;
      priorTherapy: string;
      scidDiagnosis: string;
      fullDescription: string;
    };
    risk: {
      ideation: boolean;
      attempt: boolean;
      selfHarm: boolean;
      notes: string;
    };
    scores: {
      name: string;
      value: number;
      max: number;
      level: string;
    }[];
    feedback: {
      summary: string;
      followUp: string;
      attachments: {
        name: string;
        size: string;
      }[];
    };
    rejectedBy?: string[];
  };
}

export interface ReferralTrackingData {
  destination?: {
    hospital: string;
    department: string;
    doctor: string;
    admin: string;
    transferDate: string;
    appointmentTime?: string;
  };
  steps?: ReferralStep[];
}

export interface Student {
  id: string;
  studentNumber: string;
  name: string;
  major: string;
  year: string;
  status: 'Active' | 'Inactive';
  riskLevel?: 'High' | 'Medium' | 'Low';
  riskReason?: string;
  referralReason?: string;
  scidDiagnosis?: string;
  riskFlags?: { label: string; value: boolean; severity: 'high' | 'medium' | 'none' }[];
  demographics?: {
    gender?: string;
    age?: number;
    ethnicity?: string;
    idCardNumber?: string;
    contactNumber?: string;
    email?: string;
    homeAddress?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    school?: string;
    studentId?: string; // Kept for backwards compatibility if needed
    emergencyContact?: string; // Kept for backwards compatibility
  };
  psychometrics?: {
    scores: { date: string; value: number }[];
    radarData: { subject: string; A: number; fullMark: number }[];
  };
  history?: {
    date: string;
    type: string;
    description: string;
  }[];
}
