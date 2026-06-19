export const RISK_LEVEL_STYLES: Record<string, string> = {
  High: 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]',
  Medium: 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]',
  Low: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]',
};

export const RISK_LEVEL_LABELS: Record<string, string> = {
  High: '高',
  Medium: '中',
  Low: '低'
};

export const STATUS_STYLES: Record<string, string> = {
  Approved: 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]',
  AwaitingApproval: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]',
  AwaitingTriage: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]',
  Pending: 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]',
  Closed: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]',
  Draft: 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]',
  Recalled: 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]',
  Rejected: 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]',
  AwaitingFeedbackApproval: 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]',
  WaitingForScheduling: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]',
  WaitingForAppointment: 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]',
  default: 'bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)]'
};

export const STATUS_LABELS: Record<string, string> = {
  Approved: '已批准',
  AwaitingApproval: '待审批',
  AwaitingTriage: '待分配',
  Pending: '进行中',
  Closed: '已结案',
  Draft: '草案',
  Recalled: '已撤回',
  Rejected: '被拒绝',
  AwaitingFeedbackApproval: '待随访',
  WaitingForScheduling: '待排诊',
  WaitingForAppointment: '待就诊'
};
