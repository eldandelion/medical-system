import { Role } from '../contexts/AuthContext';
import { SearchActionItem } from '../types/search';

export interface ActionExecutionContext {
  navigateToTab: (tab: string, entityId?: string | number) => void;
  openCreation?: (title: string, content: React.ReactNode) => void;
  closeCreation?: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  onLogout?: () => void;
  closeSearch: () => void;
}

export function getRoleActions(role: Role, context: ActionExecutionContext): SearchActionItem[] {
  const actions: SearchActionItem[] = [];

  // 1. Contextual Clinical & Referral Actions
  if (role === 'teacher' || role === 'head-councillor' || role === 'admin') {
    actions.push({
      id: 'action-create-referral',
      type: 'action',
      title: '发起转诊',
      subtitle: '快速创建学生就医转诊工单',
      keywords: ['转诊', '发起转诊', '新建转诊', '创建转诊', 'referral', 'create referral'],
      icon: 'add_circle',
      badge: '快捷操作',
      allowedRoles: ['teacher', 'head-councillor', 'admin'],
      onSelect: () => {
        context.closeSearch();
        context.navigateToTab('Referral Management');
      },
    });
  }

  // 2. Theme Switching Actions (All Roles)
  actions.push(
    {
      id: 'action-theme-light',
      type: 'action',
      title: '切换为浅色模式',
      subtitle: '应用浅色明亮视觉主题',
      keywords: ['浅色', '日间模式', '白色', 'light', 'theme light'],
      icon: 'light_mode',
      badge: '主题设置',
      allowedRoles: ['student', 'teacher', 'head-councillor', 'trial-admin', 'doctor', 'admin'],
      onSelect: () => {
        context.setTheme('light');
        context.closeSearch();
      },
    },
    {
      id: 'action-theme-dark',
      type: 'action',
      title: '切换为深色模式',
      subtitle: '应用深色夜间护眼主题',
      keywords: ['深色', '夜间模式', '暗色', '黑色', 'dark', 'theme dark'],
      icon: 'dark_mode',
      badge: '主题设置',
      allowedRoles: ['student', 'teacher', 'head-councillor', 'trial-admin', 'doctor', 'admin'],
      onSelect: () => {
        context.setTheme('dark');
        context.closeSearch();
      },
    },
    {
      id: 'action-theme-system',
      type: 'action',
      title: '跟随系统主题',
      subtitle: '自动根据操作系统设置切换深浅模式',
      keywords: ['跟随系统', '系统主题', '自动主题', 'system', 'auto'],
      icon: 'brightness_auto',
      badge: '主题设置',
      allowedRoles: ['student', 'teacher', 'head-councillor', 'trial-admin', 'doctor', 'admin'],
      onSelect: () => {
        context.setTheme('system');
        context.closeSearch();
      },
    }
  );

  return actions;
}

export function getRoleNavigations(role: Role, context: ActionExecutionContext): SearchActionItem[] {
  const navs: SearchActionItem[] = [];

  // Common Navigations
  navs.push(
    {
      id: 'nav-dashboard',
      type: 'navigation',
      title: '控制面板',
      subtitle: '查看整体数据概览与核心指标',
      keywords: ['控制面板', '工作台', '概览', '首页', 'dashboard', 'home'],
      icon: 'dashboard',
      badge: '系统导航',
      allowedRoles: ['student', 'teacher', 'head-councillor', 'trial-admin', 'doctor', 'admin'],
      onSelect: () => {
        context.navigateToTab('Dashboard');
        context.closeSearch();
      },
    },
    {
      id: 'nav-notifications',
      type: 'navigation',
      title: '通知中心',
      subtitle: '查看待办事项与业务提醒',
      keywords: ['通知', '通知中心', '待办', '消息', 'notifications'],
      icon: 'notifications',
      badge: '系统导航',
      allowedRoles: ['student', 'teacher', 'head-councillor', 'trial-admin', 'doctor', 'admin'],
      onSelect: () => {
        context.navigateToTab('Notifications');
        context.closeSearch();
      },
    }
  );

  // Student specific pages
  if (role === 'student') {
    navs.push(
      {
        id: 'nav-student-assessments',
        type: 'navigation',
        title: '自我测评',
        subtitle: '完成指派的心理健康量表与测评任务',
        keywords: ['测评', '自我测评', '问卷', '心理健康', 'assessments'],
        icon: 'psychology',
        badge: '系统导航',
        allowedRoles: ['student'],
        onSelect: () => {
          context.navigateToTab('Assessments');
          context.closeSearch();
        },
      },
      {
        id: 'nav-student-records',
        type: 'navigation',
        title: '我的记录',
        subtitle: '查看个人健康历程与就诊预约记录',
        keywords: ['记录', '我的记录', '就医历史', '档案', 'records'],
        icon: 'clinical_notes',
        badge: '系统导航',
        allowedRoles: ['student'],
        onSelect: () => {
          context.navigateToTab('My Records');
          context.closeSearch();
        },
      }
    );
  }

  // Teacher / Head Councillor specific pages
  if (role === 'teacher' || role === 'head-councillor') {
    navs.push(
      {
        id: 'nav-students-management',
        type: 'navigation',
        title: '学生管理',
        subtitle: role === 'teacher' ? '管理本班级管辖学生档案与健康画像' : '全校学生心理健康档案总览',
        keywords: ['学生', '学生管理', '学生名单', '学生档案', 'students'],
        icon: 'school',
        badge: '系统导航',
        allowedRoles: ['teacher', 'head-councillor'],
        onSelect: () => {
          context.navigateToTab('Students');
          context.closeSearch();
        },
      },
      {
        id: 'nav-assessments-management',
        type: 'navigation',
        title: '测评量表中心',
        subtitle: '标准化量表库与测评任务派发',
        keywords: ['量表', '测评量表', '量表管理', 'PHQ-9', 'GAD-7', 'assessments'],
        icon: 'quiz',
        badge: '系统导航',
        allowedRoles: ['teacher', 'head-councillor'],
        onSelect: () => {
          context.navigateToTab('Assessments');
          context.closeSearch();
        },
      },
      {
        id: 'nav-referral-management',
        type: 'navigation',
        title: '转诊管理',
        subtitle: '跟进学生转诊工单与医院就诊反馈',
        keywords: ['转诊', '转诊管理', '就诊记录', '医院', 'referral'],
        icon: 'swap_horiz',
        badge: '系统导航',
        allowedRoles: ['teacher', 'head-councillor'],
        onSelect: () => {
          context.navigateToTab('Referral Management');
          context.closeSearch();
        },
      }
    );
  }

  if (role === 'head-councillor') {
    navs.push({
      id: 'nav-staff-management',
      type: 'navigation',
      title: '人员管理',
      subtitle: '心理咨询中心教师与辅导员人员架构',
      keywords: ['人员', '人员管理', '教师名单', 'staff'],
      icon: 'badge',
      badge: '系统导航',
      allowedRoles: ['head-councillor'],
      onSelect: () => {
        context.navigateToTab('Staff');
        context.closeSearch();
      },
    });
  }

  // Doctor specific pages
  if (role === 'doctor') {
    navs.push({
      id: 'nav-doctor-referrals',
      type: 'navigation',
      title: '接诊与排班管理',
      subtitle: '查看分诊至本人的学生转诊案件并录入诊断反馈',
      keywords: ['转诊', '接诊', '排班', '诊断', 'referral'],
      icon: 'medical_services',
      badge: '系统导航',
      allowedRoles: ['doctor'],
      onSelect: () => {
        context.navigateToTab('Referral Management');
        context.closeSearch();
      },
    });
  }

  // Trial Admin specific pages
  if (role === 'trial-admin') {
    navs.push({
      id: 'nav-trial-admin-triage',
      type: 'navigation',
      title: '医院分诊调度',
      subtitle: '管理高校流入转诊工单并分配专科医生',
      keywords: ['分诊', '转诊管理', '医院调度', 'referral', 'triage'],
      icon: 'local_hospital',
      badge: '系统导航',
      allowedRoles: ['trial-admin'],
      onSelect: () => {
        context.navigateToTab('Referral Management');
        context.closeSearch();
      },
    });
  }

  // Admin specific pages
  if (role === 'admin') {
    navs.push(
      {
        id: 'nav-admin-users',
        type: 'navigation',
        title: '用户与权限管理',
        subtitle: '全系统账号、角色分配与账号治理',
        keywords: ['用户', '用户管理', '账号', '权限', 'users'],
        icon: 'group',
        badge: '系统导航',
        allowedRoles: ['admin'],
        onSelect: () => {
          context.navigateToTab('User Management');
          context.closeSearch();
        },
      },
      {
        id: 'nav-admin-essentials',
        type: 'navigation',
        title: '基础字典维护',
        subtitle: '高校学院、专业、合作医院与科室字典配置',
        keywords: ['基础数据', '字典', '学院', '专业', '医院', 'essentials'],
        icon: 'database',
        badge: '系统导航',
        allowedRoles: ['admin'],
        onSelect: () => {
          context.navigateToTab('Essentials');
          context.closeSearch();
        },
      }
    );
  }

  // Security Consent View for all roles
  navs.push({
    id: 'nav-security-consent',
    type: 'navigation',
    title: '隐私安全与知情同意',
    subtitle: '平台数据安全隔离说明与知情协议管理',
    keywords: ['隐私', '安全', '知情同意', '合规', 'security'],
    icon: 'lock',
    badge: '系统导航',
    allowedRoles: ['student', 'teacher', 'head-councillor', 'trial-admin', 'doctor', 'admin'],
    onSelect: () => {
      context.navigateToTab('Security & Consent');
      context.closeSearch();
    },
  });

  return navs;
}
