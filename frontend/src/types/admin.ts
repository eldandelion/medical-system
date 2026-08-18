export type AccountStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'DISABLED' | 'DELETED';

export type UserRoleType = 'STUDENT' | 'TEACHER' | 'HEAD_COUNSELLOR' | 'TRIAL_ADMIN' | 'DOCTOR' | 'SYSTEM_ADMIN';

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

export interface UpdateAccountStatusRequest {
  status: AccountStatus;
  reason?: string;
}

export interface ToggleScaleAvailabilityRequest {
  isAvailable: boolean;
}
