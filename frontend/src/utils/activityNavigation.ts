import { DashboardActivityDto } from '../api/dashboard';

export interface ActivityNavigationTarget {
  tab: string;
  entityId?: string | number;
  viewReferralId?: string | number;
  viewStudentId?: string | number;
}

export function resolveActivityNavigation(
  activity: DashboardActivityDto,
  role: string
): ActivityNavigationTarget {
  const { type, referenceId, messageCode, payload } = activity;

  // 1. Direct Referral Activities
  if (type.startsWith('REFERRAL_')) {
    const targetTab = role === 'student' ? 'My Records' : 'Referral Management';
    return {
      tab: targetTab,
      entityId: referenceId,
      viewReferralId: referenceId,
    };
  }

  // 2. Direct Assessment Activities
  if (type === 'ASSESSMENT_PENDING_COMPLETION') {
    return {
      tab: 'Assessments',
      entityId: referenceId,
    };
  }
  if (type === 'HIGH_RISK_ASSESSMENT_SUBMITTED') {
    return {
      tab: 'Notifications',
      viewStudentId: payload?.studentId,
    };
  }

  // 3. User Approvals
  if (type === 'USER_APPROVAL_PENDING') {
    if (role === 'admin') return { tab: 'User Management', entityId: referenceId };
    if (role === 'head-councillor') return { tab: 'Staff', entityId: referenceId };
    return { tab: 'Notifications' };
  }

  // 4. Notifications (SYSTEM_NOTIFICATION & UNREAD_NOTIFICATION)
  if (type === 'SYSTEM_NOTIFICATION' || type === 'UNREAD_NOTIFICATION') {
    const referralId = payload?.referralId;
    const studentId = payload?.studentId;

    if (referralId) {
      const targetTab = role === 'student' ? 'My Records' : 'Referral Management';
      return {
        tab: targetTab,
        entityId: referralId,
        viewReferralId: referralId,
      };
    }

    if (studentId && ['teacher', 'head-councillor', 'admin'].includes(role)) {
      return {
        tab: 'Students',
        entityId: studentId,
        viewStudentId: studentId,
      };
    }

    if (messageCode?.startsWith('REFERRAL_')) {
      const targetTab = role === 'student' ? 'My Records' : 'Referral Management';
      return { tab: targetTab };
    }

    if (messageCode?.startsWith('ASSESSMENT_')) {
      if (role === 'student') return { tab: 'Assessments' };
      return { tab: 'Notifications' };
    }

    return { tab: 'Notifications' };
  }

  // 5. Hospital Capacity Alert
  if (type === 'HOSPITAL_CAPACITY_ALERT') {
    if (role === 'trial-admin') return { tab: 'Staff' };
    return { tab: 'Notifications' };
  }

  return { tab: 'Notifications' };
}
