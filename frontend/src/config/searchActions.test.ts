import { describe, it, expect, vi } from 'vitest';
import { getRoleActions, getRoleNavigations, ActionExecutionContext } from './searchActions';
import { Role } from '../contexts/AuthContext';

describe('searchActions', () => {
  const createMockContext = (): ActionExecutionContext => ({
    navigateToTab: vi.fn(),
    openCreation: vi.fn(),
    closeCreation: vi.fn(),
    setTheme: vi.fn(),
    onLogout: vi.fn(),
    closeSearch: vi.fn(),
  });

  describe('getRoleActions', () => {
    it('returns referral creation action for teacher, head-councillor, and admin', () => {
      const allowedRoles: Role[] = ['teacher', 'head-councillor', 'admin'];
      for (const role of allowedRoles) {
        const ctx = createMockContext();
        const actions = getRoleActions(role, ctx);
        const referralAction = actions.find((a) => a.id === 'action-create-referral');
        expect(referralAction).toBeDefined();

        referralAction?.onSelect();
        expect(ctx.closeSearch).toHaveBeenCalled();
        expect(ctx.navigateToTab).toHaveBeenCalledWith('Referral Management');
      }
    });

    it('does not return referral creation action for student, doctor, or trial-admin', () => {
      const disallowedRoles: Role[] = ['student', 'doctor', 'trial-admin'];
      for (const role of disallowedRoles) {
        const ctx = createMockContext();
        const actions = getRoleActions(role, ctx);
        const referralAction = actions.find((a) => a.id === 'action-create-referral');
        expect(referralAction).toBeUndefined();
      }
    });

    it('returns theme switching actions for all roles and executes handlers properly', () => {
      const roles: Role[] = ['student', 'teacher', 'head-councillor', 'trial-admin', 'doctor', 'admin'];
      for (const role of roles) {
        const ctx = createMockContext();
        const actions = getRoleActions(role, ctx);

        const lightAction = actions.find((a) => a.id === 'action-theme-light');
        const darkAction = actions.find((a) => a.id === 'action-theme-dark');
        const systemAction = actions.find((a) => a.id === 'action-theme-system');

        expect(lightAction).toBeDefined();
        expect(darkAction).toBeDefined();
        expect(systemAction).toBeDefined();

        lightAction?.onSelect();
        expect(ctx.setTheme).toHaveBeenCalledWith('light');
        expect(ctx.closeSearch).toHaveBeenCalled();

        darkAction?.onSelect();
        expect(ctx.setTheme).toHaveBeenCalledWith('dark');

        systemAction?.onSelect();
        expect(ctx.setTheme).toHaveBeenCalledWith('system');
      }
    });
  });

  describe('getRoleNavigations', () => {
    it('provides common navigations (dashboard, notifications, security-consent) for all roles', () => {
      const roles: Role[] = ['student', 'teacher', 'head-councillor', 'trial-admin', 'doctor', 'admin'];
      for (const role of roles) {
        const ctx = createMockContext();
        const navs = getRoleNavigations(role, ctx);

        const dashboard = navs.find((n) => n.id === 'nav-dashboard');
        const notifications = navs.find((n) => n.id === 'nav-notifications');
        const security = navs.find((n) => n.id === 'nav-security-consent');

        expect(dashboard).toBeDefined();
        expect(notifications).toBeDefined();
        expect(security).toBeDefined();

        dashboard?.onSelect();
        expect(ctx.navigateToTab).toHaveBeenCalledWith('Dashboard');
        expect(ctx.closeSearch).toHaveBeenCalled();

        notifications?.onSelect();
        expect(ctx.navigateToTab).toHaveBeenCalledWith('Notifications');

        security?.onSelect();
        expect(ctx.navigateToTab).toHaveBeenCalledWith('Security & Consent');
      }
    });

    it('provides student specific navigations and executes onSelect', () => {
      const ctx = createMockContext();
      const navs = getRoleNavigations('student', ctx);

      const assessments = navs.find((n) => n.id === 'nav-student-assessments');
      const records = navs.find((n) => n.id === 'nav-student-records');

      expect(assessments).toBeDefined();
      expect(records).toBeDefined();

      assessments?.onSelect();
      expect(ctx.navigateToTab).toHaveBeenCalledWith('Assessments');

      records?.onSelect();
      expect(ctx.navigateToTab).toHaveBeenCalledWith('My Records');
    });

    it('provides teacher specific navigations and executes onSelect', () => {
      const ctx = createMockContext();
      const navs = getRoleNavigations('teacher', ctx);

      const students = navs.find((n) => n.id === 'nav-students-management');
      const assessments = navs.find((n) => n.id === 'nav-assessments-management');
      const referrals = navs.find((n) => n.id === 'nav-referral-management');

      expect(students).toBeDefined();
      expect(students?.subtitle).toContain('本班级管辖学生');
      expect(assessments).toBeDefined();
      expect(referrals).toBeDefined();

      students?.onSelect();
      expect(ctx.navigateToTab).toHaveBeenCalledWith('Students');

      assessments?.onSelect();
      expect(ctx.navigateToTab).toHaveBeenCalledWith('Assessments');

      referrals?.onSelect();
      expect(ctx.navigateToTab).toHaveBeenCalledWith('Referral Management');
    });

    it('provides head-councillor specific navigations including staff management', () => {
      const ctx = createMockContext();
      const navs = getRoleNavigations('head-councillor', ctx);

      const students = navs.find((n) => n.id === 'nav-students-management');
      expect(students?.subtitle).toContain('全校学生心理健康档案总览');

      const staff = navs.find((n) => n.id === 'nav-staff-management');
      expect(staff).toBeDefined();
      staff?.onSelect();
      expect(ctx.navigateToTab).toHaveBeenCalledWith('Staff');
    });

    it('provides doctor specific navigations and executes onSelect', () => {
      const ctx = createMockContext();
      const navs = getRoleNavigations('doctor', ctx);

      const referrals = navs.find((n) => n.id === 'nav-doctor-referrals');
      expect(referrals).toBeDefined();
      referrals?.onSelect();
      expect(ctx.navigateToTab).toHaveBeenCalledWith('Referral Management');
    });

    it('provides trial-admin specific navigations and executes onSelect', () => {
      const ctx = createMockContext();
      const navs = getRoleNavigations('trial-admin', ctx);

      const triage = navs.find((n) => n.id === 'nav-trial-admin-triage');
      expect(triage).toBeDefined();
      triage?.onSelect();
      expect(ctx.navigateToTab).toHaveBeenCalledWith('Referral Management');
    });

    it('provides admin specific navigations (users, essentials) and executes onSelect', () => {
      const ctx = createMockContext();
      const navs = getRoleNavigations('admin', ctx);

      const users = navs.find((n) => n.id === 'nav-admin-users');
      const essentials = navs.find((n) => n.id === 'nav-admin-essentials');

      expect(users).toBeDefined();
      expect(essentials).toBeDefined();

      users?.onSelect();
      expect(ctx.navigateToTab).toHaveBeenCalledWith('User Management');

      essentials?.onSelect();
      expect(ctx.navigateToTab).toHaveBeenCalledWith('Essentials');
    });
  });
});
