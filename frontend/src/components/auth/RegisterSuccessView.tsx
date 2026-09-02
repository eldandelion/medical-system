import * as React from 'react';
import { motion } from 'motion/react';
import { PrimaryButton } from '../common/Buttons';
import { CsuLogo } from './LoginOverlay';
import { type RegisterRole } from './RegisterRoleSelect';

export interface RegisterSuccessViewProps {
  role?: RegisterRole | null;
  name: string;
  email: string;
  workerNumber?: string;
  onGoToLogin: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  'teacher': '教师',
  'head-councillor': '主任咨询师',
  'trial-admin': '医院分诊管理员',
  'doctor': '精神科医生',
};

export function RegisterSuccessView({
  role,
  name,
  email,
  workerNumber,
  onGoToLogin,
}: RegisterSuccessViewProps) {
  const roleLabel = role ? ROLE_LABELS[role] || role : '教职工/医护人员';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 flex-1 w-full"
    >
      {/* Left Column: Branding & Overview */}
      <div className="flex flex-col justify-start">
        <div className="h-[32px] flex items-center">
          <CsuLogo />
        </div>

        <div className="mt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-medium mb-3">
            <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
            <span>等待管理员审核</span>
          </div>

          <h1 className="text-[32px] sm:text-[36px] leading-[40px] sm:leading-[44px] font-normal text-[var(--md-sys-color-on-surface)] tracking-tight">
            注册申请已提交
          </h1>
          <p className="text-[15px] sm:text-[16px] leading-[24px] text-[var(--md-sys-color-on-surface-variant)] mt-2.5 font-normal">
            您的注册申请已进入系统管理员审批队列
          </p>
        </div>
      </div>

      {/* Right Column: Submission Summary Card & Action Button */}
      <div className="flex flex-col justify-between h-full">
        {/* Alignment spacer on desktop */}
        <div className="hidden md:flex h-[32px] items-center" />

        <div className="mt-0 md:mt-6 flex flex-col justify-between flex-1">
          <div className="space-y-4">
            {/* Outlined Submission Summary Card */}
            <div className="rounded-[16px] p-6 border border-[var(--md-sys-color-outline-variant)] space-y-3 bg-[var(--md-sys-color-surface-container-low)]/30">
              <div className="flex items-center justify-between py-1.5 border-b border-[var(--md-sys-color-outline-variant)]/40">
                <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">申请姓名</span>
                <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">{name}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[var(--md-sys-color-outline-variant)]/40">
                <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">申请身份</span>
                <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">{roleLabel}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[var(--md-sys-color-outline-variant)]/40">
                <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">登录邮箱</span>
                <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">{email}</span>
              </div>
              {workerNumber && (
                <div className="flex items-center justify-between py-1.5 border-b border-[var(--md-sys-color-outline-variant)]/40">
                  <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">教工号 / 医工号</span>
                  <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">{workerNumber}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">账号状态</span>
                <span className="text-[13px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-900/40 px-2.5 py-0.5 rounded-full">
                  待管理员审核
                </span>
              </div>
            </div>

            <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed px-1">
              💡 管理员将在 1-2 个工作日内完成身份核实与权限开通。审核通过后，您即可使用注册邮箱与密码登录。
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 mt-auto">
            <PrimaryButton
              label="返回登录"
              onClick={onGoToLogin}
              noCollapse
              className="px-6 rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
