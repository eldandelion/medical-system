import { Role } from '../contexts/AuthContext';

export interface StudentSearchResultDto {
  id: number;
  studentNumber: string;
  name: string;
  majorName: string | null;
  collegeName: string | null;
  enrollmentDate: string | null;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | null;
}

export interface ReferralSearchResultDto {
  id: string;
  studentId: number;
  studentName: string | null;
  studentNumber: string | null;
  title: string;
  descriptionSnippet: string;
  status: string;
  type: string;
  createdAt: string;
  destinationHospitalName: string | null;
  destinationDoctorName: string | null;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | null;
}

export interface AssessmentSearchResultDto {
  id: string;
  resultType: 'ASSIGNMENT' | 'CATALOG';
  batteryCode: string;
  title: string;
  subtitle: string | null;
  status: string | null;
  assignedByName: string | null;
  dueDate: string | null;
  duration: string | null;
}

export interface SearchResultDto {
  query: string;
  students: StudentSearchResultDto[];
  referrals: ReferralSearchResultDto[];
  assessments: AssessmentSearchResultDto[];
}

export interface SearchActionItem {
  id: string;
  type: 'action' | 'navigation';
  title: string;
  subtitle?: string;
  keywords: string[];
  icon: string;
  badge?: string;
  allowedRoles: Role[];
  onSelect: () => void;
}

export type FlatSearchItem =
  | { kind: 'action'; item: SearchActionItem }
  | { kind: 'navigation'; item: SearchActionItem }
  | { kind: 'student'; item: StudentSearchResultDto }
  | { kind: 'referral'; item: ReferralSearchResultDto }
  | { kind: 'assessment'; item: AssessmentSearchResultDto };
