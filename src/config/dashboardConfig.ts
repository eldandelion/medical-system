export interface MetricConfig {
  icon: string;
  label: string;
  containerColorClass: string;
  targetPage: string;
  metricKey: string;
}

export const STUDENT_METRICS_CONFIG: MetricConfig[] = [
  {
    icon: "assignment_late",
    label: "待完成测评",
    containerColorClass: "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]",
    targetPage: "Assessments",
    metricKey: "assessmentsCount"
  },
  {
    icon: "notifications",
    label: "未读通知",
    containerColorClass: "bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]",
    targetPage: "Notifications",
    metricKey: "notificationsCount"
  }
];

export const TEACHER_METRICS_CONFIG: MetricConfig[] = [
  {
    icon: "group",
    label: "分配学生",
    containerColorClass: "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]",
    targetPage: "Students",
    metricKey: "studentsCount"
  },
  {
    icon: "assignment_late",
    label: "待处理转诊",
    containerColorClass: "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]",
    targetPage: "Referral Management",
    metricKey: "referralsCount"
  }
];

export const HEAD_COUNCILLOR_METRICS_CONFIG: MetricConfig[] = [
  {
    icon: "group",
    label: "学生总数",
    containerColorClass: "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]",
    targetPage: "Students",
    metricKey: "studentsCount"
  },
  {
    icon: "assignment_late",
    label: "待处理转诊",
    containerColorClass: "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]",
    targetPage: "Referral Management",
    metricKey: "referralsCount"
  }
];

export const TRIAL_ADMIN_METRICS_CONFIG: MetricConfig[] = [
  {
    icon: "engineering",
    label: "人员总数",
    containerColorClass: "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]",
    targetPage: "Staff",
    metricKey: "staffCount"
  },
  {
    icon: "assignment_late",
    label: "待审核转诊",
    containerColorClass: "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]",
    targetPage: "Referral Management",
    metricKey: "referralsCount"
  }
];
