export const RISK_LEVEL_STYLES: Record<string, string> = {
  HIGH: 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]',
  MEDIUM: 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]',
  LOW: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]',
};

export const RISK_LEVEL_DOT_STYLES: Record<string, string> = {
  HIGH: 'bg-[var(--md-sys-color-error-container)]',
  MEDIUM: 'bg-[var(--md-sys-color-tertiary-container)]',
  LOW: 'bg-[var(--md-sys-color-secondary-container)]',
  High: 'bg-[var(--md-sys-color-error-container)]',
  Medium: 'bg-[var(--md-sys-color-tertiary-container)]',
  Low: 'bg-[var(--md-sys-color-secondary-container)]',
};

export const RISK_LEVEL_LABELS: Record<string, string> = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低'
};

export const STATUS_STYLES: Record<string, string> = {
  APPROVED: 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]',
  AWAITING_APPROVAL: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]',
  AWAITING_REVIEW: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]',
  AWAITING_TRIAGE: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]',
  NEEDS_REASSIGNMENT: 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]',
  ERROR: 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]',
  PENDING: 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]',
  CLOSED: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]',
  DRAFT: 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]',
  RECALLED: 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]',
  REJECTED: 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]',
  AWAITING_FEEDBACK_APPROVAL: 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]',
  WAITING_FOR_SCHEDULING: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]',
  WAITING_FOR_APPOINTMENT: 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]',
  default: 'bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)]'
};

export const STATUS_DOT_STYLES: Record<string, string> = {
  APPROVED: 'bg-[var(--md-sys-color-primary-container)]',
  AWAITING_APPROVAL: 'bg-[var(--md-sys-color-secondary-container)]',
  AWAITING_REVIEW: 'bg-[var(--md-sys-color-secondary-container)]',
  AWAITING_TRIAGE: 'bg-[var(--md-sys-color-secondary-container)]',
  NEEDS_REASSIGNMENT: 'bg-[var(--md-sys-color-error-container)]',
  ERROR: 'bg-[var(--md-sys-color-error-container)]',
  PENDING: 'bg-[var(--md-sys-color-tertiary-container)]',
  CLOSED: 'bg-[var(--md-sys-color-secondary-container)]',
  DRAFT: 'bg-[var(--md-sys-color-surface-container-high)]',
  RECALLED: 'bg-[var(--md-sys-color-surface-container-highest)]',
  REJECTED: 'bg-[var(--md-sys-color-error-container)]',
  AWAITING_FEEDBACK_APPROVAL: 'bg-[var(--md-sys-color-tertiary-container)]',
  WAITING_FOR_SCHEDULING: 'bg-[var(--md-sys-color-secondary-container)]',
  WAITING_FOR_APPOINTMENT: 'bg-[var(--md-sys-color-primary-container)]',
  default: 'bg-[var(--md-sys-color-surface-variant)]'
};

export const STATUS_LABELS: Record<string, string> = {
  APPROVED: '已批准',
  AWAITING_APPROVAL: '待审批',
  AWAITING_REVIEW: '待评估',
  AWAITING_TRIAGE: '待分配',
  NEEDS_REASSIGNMENT: '待重新分配',
  ERROR: '异常',
  PENDING: '进行中',
  CLOSED: '已结案',
  DRAFT: '草案',
  RECALLED: '已撤回',
  REJECTED: '被拒绝',
  AWAITING_FEEDBACK_APPROVAL: '待随访',
  WAITING_FOR_SCHEDULING: '待排诊',
  WAITING_FOR_APPOINTMENT: '待就诊'
};

export const REFERRAL_TYPE_LABELS: Record<string, string> = {
  INITIAL: '初次转诊',
  FOLLOW_UP: '复诊转诊',
  EMERGENCY: '紧急转诊'
};
