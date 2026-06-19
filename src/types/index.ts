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

export interface Referral {
  id: string;
  studentName: string;
  type: string;
  date: string;
  title: string;
  description: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  status: 'Draft' | 'Closed' | 'Pending' | 'Approved' | 'AwaitingApproval' | 'Recalled' | 'AwaitingFeedbackApproval' | 'Error' | 'Rejected' | 'WaitingForScheduling' | 'WaitingForAppointment';
  displayStatus?: string;
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
    destination: {
      hospital: string;
      department: string;
      doctor: string;
      admin: string;
      transferDate: string;
      appointmentTime?: string;
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
    steps?: ReferralStep[];
  };
}

export interface Student {
  id: string;
  name: string;
  major: string;
  year: string;
  status: 'Active' | 'Inactive';
  riskLevel?: 'High' | 'Moderate' | 'Low';
  riskReason?: string;
  referralReason?: string;
  scidDiagnosis?: string;
  riskFlags?: { label: string; value: boolean; severity: 'high' | 'medium' | 'none' }[];
  demographics?: {
    age: number;
    gender: string;
    studentId: string;
    emergencyContact: string;
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
