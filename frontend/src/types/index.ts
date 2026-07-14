export type ReferralStepStatus = 'COMPLETED' | 'ISSUE' | 'PENDING' | 'ACTIVE';
export type ReferralStepType = 'INITIATION' | 'REVIEW' | 'TRIAGE' | 'SCHEDULING' | 'EVALUATION' | 'FEEDBACK';

export type ClinicalStatusType = 'FIRST_VISIT' | 'MEDICATED' | 'PRIOR_THERAPY';
export type SevereRiskFactorType = 'SUICIDAL_IDEATION' | 'SUICIDE_ATTEMPT' | 'SELF_HARM';

export interface ReferralStep {
  id: string | number;
  type: ReferralStepType;
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
  type: 'INITIAL' | 'FOLLOW_UP' | 'EMERGENCY' | string;
  date: string;
  title: string;
  description: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'DRAFT' | 'CLOSED' | 'AWAITING_TRIAGE' | 'AWAITING_REVIEW' | 'RECALLED' | 'AWAITING_FEEDBACK_APPROVAL' | 'ERROR' | 'REJECTED' | 'WAITING_FOR_SCHEDULING' | 'WAITING_FOR_APPOINTMENT';
  displayStatus?: string;
  availableActions?: ReferralAction[];
  referredBy?: {
    name: string;
    avatar?: string;
  };
  appointment?: Appointment;
}

export interface Appointment {
  doctorId: number;
  appointmentTime: string;
  status: string;
}

export interface Attachment {
  name: String;
  size: String;
}

export interface ReferralDetails {
  baseInfo: Referral;
  studentDemographics: {
    age?: number;
    gender?: string;
    studentId: string;
    school: string;
    grade: string;
    phone: string;
  };
  triageInfo: {
    isFirstVisit: boolean;
    isMedicated: boolean;
    priorTherapy: string;
    scidDiagnosis?: string;
    fullDescription: string;
  };
  riskAssessment: {
    ideation: boolean;
    attempt: boolean;
    selfHarm: boolean;
    notes?: string;
  };
  feedback?: {
    summary: string;
    followUp: string;
    attachments: Attachment[];
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
  riskLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
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
