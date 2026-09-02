export type UserRole = 'STUDENT' | 'TEACHER' | 'HEAD_COUNSELLOR' | 'TRIAL_ADMIN' | 'DOCTOR' | 'SYSTEM_ADMIN';

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
  | 'reassign_doctor'
  | 'cancel_referral';

export interface Referral {
  id: string;
  studentId?: number | string;
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
  attachments?: Attachment[];
}

export interface Appointment {
  doctorId: number;
  appointmentTime: string;
  status: string;
}

export interface Attachment {
  name: string;
  size: string;
  fileId?: number | string;
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
  attachments?: Attachment[];
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
  year?: string;
  degreeLevel?: string;
  degreeLevelId?: number;
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

export interface StudentMetricsDto {
  assessmentsCount: number;
  notificationsCount: number;
}

export interface TeacherMetricsDto {
  studentsCount: number;
  notificationsCount: number;
}

export interface HeadCouncillorMetricsDto {
  studentsCount: number;
  referralsCount: number;
}

export interface TrialAdminMetricsDto {
  staffCount: number;
  referralsCount: number;
}

export interface DoctorMetricsDto {
  referralsCount: number;
  notificationsCount: number;
}

export interface AdminMetricsDto {
  totalUsersCount: number;
  pendingApprovalsCount: number;
  activeReferralsCount: number;
  completedAssessmentsCount: number;
}

export interface DashboardResponseDto<T> {
  metrics: T;
  activityTitle?: string;
  activities?: Array<{
    id: string;
    title: string;
    timestamp: string;
    statusText: string;
    statusType?: any;
  }>;
}

export type AssessmentScaleType =
  | 'PHQ_9'
  | 'GAD_7'
  | 'SLEEP_DISORDER'
  | 'APQ_9_FATHER'
  | 'APQ_9_MOTHER'
  | 'COMPREHENSIVE_MENTAL';

export type AssessmentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'REVOKED';

export interface AssessmentAssignmentHistoryDto {
  id: number;
  batteryCode: string;
  assignedByName: string;
  assignedById: number;
  status: AssessmentStatus;
  assignedAt: string;
  completedAt?: string;
  revokedAt?: string;
}

export interface AssessmentOptionDto {
  value: number;
  label: string;
}

export interface AssessmentQuestionDto {
  id: string;
  text: string;
  options?: AssessmentOptionDto[];
}

export interface AssessmentSectionDto {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  questions: AssessmentQuestionDto[];
}

export interface AssessmentCatalogItemDto {
  batteryCode: AssessmentScaleType;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  questionCount: number;
  sections: AssessmentSectionDto[];
  isEnabled?: boolean;
}

export interface AssignedByDto {
  name: string;
  initial: string;
}

export interface AssessmentListItemDto {
  id: number | string;
  title: string;
  subtitle?: string;
  batteryCode: AssessmentScaleType;
  assignedBy: AssignedByDto;
  type: string;
  completionPercentage: number;
  duration: string;
  status: AssessmentStatus;
  assignedAt: string;
  completedAt?: string | null;
  dueDate?: string | null;
  sections?: AssessmentSectionDto[];
}

export interface AssessmentDetailsDto {
  id: number | string;
  title: string;
  subtitle?: string;
  batteryCode: AssessmentScaleType;
  assignedBy: AssignedByDto;
  duration: string;
  status: AssessmentStatus;
  sections: AssessmentSectionDto[];
  requiredQuestionIds: string[];
}

export interface AssignAssessmentRequest {
  studentId: number | string;
  batteryCodes: AssessmentScaleType[];
  dueDate?: string | null;
}

export interface AssignCohortAssessmentRequest {
  majorId?: number | string | null;
  collegeId?: number | string | null;
  academicYear?: number | null;
  batteryCodes: AssessmentScaleType[];
  dueDate?: string | null;
}

export interface BatchAssignResultDto {
  assignedCount: number;
}

export interface SubmitAssessmentRequest {
  answers: { questionId: string; selectedValue: number }[];
}

export interface AssessmentSubmissionResponseDto {
  success: boolean;
  assignmentId: number;
  totalQuestionsAnswered: number;
  completedAt: string;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface StudentProfileDetailsDto {
  studentNumber: string;
  school?: string | null;
  major?: string | null;
  academicYear?: string | null;
  gender?: Gender | null;
  birthday?: string | null;
  ethnicity?: string | null;
  idCardNumber?: string | null;
  contactNumber?: string | null;
  homeAddress?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
}

export interface StaffProfileDetailsDto {
  employeeNumber: string;
  organization?: string | null;
  department?: string | null;
  title?: string | null;
  contactNumber?: string | null;
}

export interface UserProfileDto {
  id: number;
  name: string;
  role: string;
  email: string;
  avatarInitial?: string | null;
  avatarBg?: string | null;
  passwordLastChanged?: string | null;
  studentProfile?: StudentProfileDetailsDto | null;
  staffProfile?: StaffProfileDetailsDto | null;
}

export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
  avatarInitial?: string;
  avatarBg?: string;
  gender?: Gender;
  birthday?: string;
  ethnicity?: string;
  idCardNumber?: string;
  contactNumber?: string;
  homeAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
}

export * from './studentImport';

