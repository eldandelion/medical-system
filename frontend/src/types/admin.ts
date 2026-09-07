import { DemographicsDto } from './index';

export type AccountStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'DISABLED' | 'DELETED';

export type UserRoleType = 'STUDENT' | 'TEACHER' | 'HEAD_COUNSELLOR' | 'TRIAL_ADMIN' | 'DOCTOR' | 'SYSTEM_ADMIN';

export interface UserAffiliationDto {
  identifier?: string | null;
  primaryOrganization?: string | null;
  departmentOrMajor?: string | null;
  titleOrDegree?: string | null;
  enrollmentYear?: number | null;
}

export interface AdminUserSummaryDto {
  id: number;
  name: string;
  email: string;
  role: UserRoleType;
  status: AccountStatus;
  employeeOrStudentId?: string | null;
  departmentOrCollege?: string | null;
  hospital?: string | null;
  deletedAt?: string | null;
}

export interface AdminUserDetailsDto extends AdminUserSummaryDto {
  affiliation?: UserAffiliationDto;
  demographics?: DemographicsDto | null;
  contactNumber?: string | null;
  homeAddress?: string | null;
}

export interface UpdateAccountStatusRequest {
  status: AccountStatus;
  reason?: string;
}

export interface ToggleScaleAvailabilityRequest {
  isAvailable: boolean;
}
