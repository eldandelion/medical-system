import { ActivityStatusType } from '../../config/dashboardConfig';

export interface DashboardData {
  profileSummary: {
    avatarUrl: string | null;
    name: string;
    role: string;
    studentId?: string;
    school?: string;
    employeeId?: string;
    department?: string;
    accessLevel?: string;
    doctorId?: number;
  };
  metrics: Record<string, number>;
  activityTitle: string;
  activities: {
    id: string;
    name: string;
    timestamp: string;
    statusText: string;
    statusType: ActivityStatusType;
  }[];
}

export const mockDashboardDb: Record<string, DashboardData> = {
  student: {
    profileSummary: {
      avatarUrl: null,
      name: "达尼尔·彼得罗夫",
      role: "STUDENT",
      studentId: "987654321",
      school: "计算机科学与工程学院"
    },
    metrics: {
      assessmentsCount: 2,
      notificationsCount: 3
    },
    activityTitle: "最近记录",
    activities: [
      {
        id: '1',
        name: '完成期中自我测评',
        timestamp: '2天后到期',
        statusText: '需处理',
        statusType: 'error'
      },
      {
        id: '2',
        name: '查看反馈摘要：算法',
        timestamp: '昨天发布',
        statusText: '未读',
        statusType: 'info'
      },
      {
        id: '3',
        name: '更新年度知情同意书',
        timestamp: '下学期必需',
        statusText: '待处理',
        statusType: 'neutral'
      }
    ]
  },
  teacher: {
    profileSummary: {
      avatarUrl: null,
      name: "艾米丽·沃森博士",
      role: "TEACHER",
      employeeId: "T-88291",
      department: "心理学系"
    },
    metrics: {
      studentsCount: 42,
      notificationsCount: 3
    },
    activityTitle: "最近活动",
    activities: [
      {
        id: '1',
        name: '新分配学生：达尼尔·彼得罗夫',
        timestamp: '2小时前',
        statusText: '高风险标识',
        statusType: 'error'
      },
      {
        id: '2',
        name: '转诊更新：爱丽丝·史密斯',
        timestamp: '昨天',
        statusText: '审核中',
        statusType: 'info'
      }
    ]
  },
  'head-councillor': {
    profileSummary: {
      avatarUrl: null,
      name: "张明诚",
      role: "HEAD_COUNSELLOR",
      employeeId: "HC-1001",
      department: "咨询中心"
    },
    metrics: {
      studentsCount: 124,
      referralsCount: 12
    },
    activityTitle: "全局活动",
    activities: [
      {
        id: '1',
        name: '新分配学生：达尼尔·彼得罗夫',
        timestamp: '2小时前',
        statusText: '高风险标识',
        statusType: 'error'
      },
      {
        id: '2',
        name: '转诊更新：爱丽丝·史密斯',
        timestamp: '昨天',
        statusText: '审核中',
        statusType: 'info'
      }
    ]
  },
  'trial-admin': {
    profileSummary: {
      avatarUrl: null,
      name: "赵敏",
      role: "TRIAL_ADMIN",
      employeeId: "TA-9009",
      accessLevel: "限制访问"
    },
    metrics: {
      staffCount: 42,
      referralsCount: 8
    },
    activityTitle: "全局活动",
    activities: [
      {
        id: '1',
        name: '新转诊申请：转诊中心',
        timestamp: '1小时前',
        statusText: '待审核',
        statusType: 'info'
      },
      {
        id: '2',
        name: '系统维护通知',
        timestamp: '昨天',
        statusText: '已发布',
        statusType: 'warning'
      }
    ]
  },
  doctor: {
    profileSummary: {
      avatarUrl: null,
      name: "李医生",
      role: "DOCTOR",
      employeeId: "DR-5005",
      accessLevel: "医生权限",
      doctorId: 1
    },
    metrics: {
      referralsCount: 6,
      notificationsCount: 2
    },
    activityTitle: "最近随访",
    activities: [
      {
        id: '1',
        name: '需出具随访报告：李四',
        timestamp: '1小时前',
        statusText: '待处理',
        statusType: 'error'
      },
      {
        id: '2',
        name: '已完成随访：王五',
        timestamp: '昨天',
        statusText: '已完成',
        statusType: 'info'
      }
    ]
  },
  admin: {
    profileSummary: {
      avatarUrl: null,
      name: "系统管理员",
      role: "SYSTEM_ADMIN",
      employeeId: "SYS-ADMIN",
      department: "系统管理部"
    },
    metrics: {
      totalUsersCount: 248,
      pendingApprovalsCount: 2,
      activeReferralsCount: 14,
      completedAssessmentsCount: 312
    },
    activityTitle: "全局系统活动",
    activities: [
      {
        id: '1',
        name: '新教师注册待审核：赵老师',
        timestamp: '10分钟前',
        statusText: '待审核',
        statusType: 'warning'
      },
      {
        id: '2',
        name: '转诊自动预警：高危心理筛查',
        timestamp: '1小时前',
        statusText: '需跟进',
        statusType: 'error'
      }
    ]
  }
};

import { DashboardActivityFeedDto, ActivityType } from '../../api/dashboard';

export const mockDashboardActivities: Record<string, DashboardActivityFeedDto> = {
  student: {
    activities: [
      { id: 'assess-1', type: 'ASSESSMENT_PENDING_COMPLETION', timestamp: new Date().toISOString(), referenceId: 1, referenceName: '期中自我测评' },
      { id: 'notif-1', type: 'UNREAD_NOTIFICATION', timestamp: new Date(Date.now() - 86400000).toISOString(), referenceId: 2, referenceName: 'SYSTEM_ALERT' }
    ]
  },
  teacher: {
    activities: [
      { id: 'notif-2', type: 'UNREAD_NOTIFICATION', timestamp: new Date(Date.now() - 3600000).toISOString(), referenceId: 3, referenceName: 'STUDENT_RISK' }
    ]
  },
  'head-councillor': {
    activities: [
      { id: 'ref-1', type: 'REFERRAL_PENDING_TRIAGE', timestamp: new Date(Date.now() - 7200000).toISOString(), referenceId: 4, referenceName: '转诊申请 - 高风险' }
    ]
  },
  'trial-admin': {
    activities: [
      { id: 'ref-2', type: 'REFERRAL_PENDING_SCHEDULING', timestamp: new Date(Date.now() - 3600000).toISOString(), referenceId: 5, referenceName: '转诊申请 - 中风险' }
    ]
  },
  doctor: {
    activities: [
      { id: 'ref-3', type: 'REFERRAL_PENDING_FEEDBACK', timestamp: new Date(Date.now() - 1800000).toISOString(), referenceId: 6, referenceName: '转诊报告需出具' }
    ]
  },
  admin: {
    activities: [
      { id: 'user-1', type: 'USER_APPROVAL_PENDING', timestamp: new Date(Date.now() - 600000).toISOString(), referenceId: 7, referenceName: '赵老师' }
    ]
  }
};
