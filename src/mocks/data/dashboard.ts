import { ActivityStatusType } from '../../config/dashboardConfig';

export interface DashboardData {
  profileSummary: {
    avatarText: string;
    title: string;
    subtitle: string;
    studentId?: string;
    school?: string;
    employeeId?: string;
    department?: string;
    accessLevel?: string;
  };
  metrics: Record<string, number>;
  activityTitle: string;
  activities: {
    id: string;
    title: string;
    timestamp: string;
    statusText: string;
    statusType: ActivityStatusType;
  }[];
}

export const mockDashboardDb: Record<string, DashboardData> = {
  student: {
    profileSummary: {
      avatarText: "D",
      title: "达尼尔·彼得罗夫",
      subtitle: "中南大学学生",
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
        title: '完成期中自我测评',
        timestamp: '2天后到期',
        statusText: '需处理',
        statusType: 'error'
      },
      {
        id: '2',
        title: '查看反馈摘要：算法',
        timestamp: '昨天发布',
        statusText: '未读',
        statusType: 'info'
      },
      {
        id: '3',
        title: '更新年度知情同意书',
        timestamp: '下学期必需',
        statusText: '待处理',
        statusType: 'neutral'
      }
    ]
  },
  teacher: {
    profileSummary: {
      avatarText: "E",
      title: "艾米丽·沃森博士",
      subtitle: "教研人员",
      employeeId: "T-88291",
      department: "心理学系"
    },
    metrics: {
      studentsCount: 42,
      referralsCount: 5
    },
    activityTitle: "最近活动",
    activities: [
      {
        id: '1',
        title: '新分配学生：达尼尔·彼得罗夫',
        timestamp: '2小时前',
        statusText: '高风险标识',
        statusType: 'error'
      },
      {
        id: '2',
        title: '转诊更新：爱丽丝·史密斯',
        timestamp: '昨天',
        statusText: '审核中',
        statusType: 'info'
      }
    ]
  },
  'head-councillor': {
    profileSummary: {
      avatarText: "张",
      title: "张明诚",
      subtitle: "主任辅导员",
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
        title: '新分配学生：达尼尔·彼得罗夫',
        timestamp: '2小时前',
        statusText: '高风险标识',
        statusType: 'error'
      },
      {
        id: '2',
        title: '转诊更新：爱丽丝·史密斯',
        timestamp: '昨天',
        statusText: '审核中',
        statusType: 'info'
      }
    ]
  },
  'trial-admin': {
    profileSummary: {
      avatarText: "赵",
      title: "赵敏",
      subtitle: "初试管理员",
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
        title: '新转诊申请：转诊中心',
        timestamp: '1小时前',
        statusText: '待审核',
        statusType: 'info'
      },
      {
        id: '2',
        title: '系统维护通知',
        timestamp: '昨天',
        statusText: '已发布',
        statusType: 'warning'
      }
    ]
  }
};
