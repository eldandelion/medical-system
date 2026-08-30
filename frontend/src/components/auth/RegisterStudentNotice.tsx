import * as React from 'react';
import { motion } from 'motion/react';
import { PrimaryButton } from '../common/Buttons';
import { CsuLogo } from './LoginOverlay';

export interface RegisterStudentNoticeProps {
  onBack?: () => void;
  onGoToLogin: () => void;
}

export function RegisterStudentNotice({
  onGoToLogin,
}: RegisterStudentNoticeProps) {
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
          <h1 className="text-[32px] sm:text-[36px] leading-[40px] sm:leading-[44px] font-normal text-[var(--md-sys-color-on-surface)] tracking-tight">
            学生无需注册
          </h1>
          <p className="text-[15px] sm:text-[16px] leading-[24px] text-[var(--md-sys-color-on-surface-variant)] mt-2.5 font-normal">
            学生账号已由学校统一预先创建
          </p>
        </div>
      </div>

      {/* Right Column: Information Card & Credentials Guide */}
      <div className="flex flex-col justify-between h-full">
        {/* Alignment spacer on desktop */}
        <div className="hidden md:flex h-[32px] items-center" />

        <div className="mt-0 md:mt-6 flex flex-col justify-between flex-1">
          <div className="space-y-4">
            {/* Outlined Credentials Details Card */}
            <div className="rounded-[16px] p-6 border border-[var(--md-sys-color-outline-variant)] space-y-4">
              <div className="flex items-start justify-between py-2 border-b border-[var(--md-sys-color-outline-variant)]/40">
                <span className="text-[15px] text-[var(--md-sys-color-on-surface-variant)]">登录账号</span>
                <span className="text-[15px] font-medium text-[var(--md-sys-color-on-surface)]">学号</span>
              </div>
              <div className="flex items-start justify-between py-2">
                <span className="text-[15px] text-[var(--md-sys-color-on-surface-variant)]">初始密码</span>
                <span className="text-[15px] font-medium text-[var(--md-sys-color-on-surface)] text-right">
                  身份证号后 6 位
                  <span className="block text-[13px] text-[var(--md-sys-color-on-surface-variant)] font-normal mt-0.5">
                    （若最后一位为字母，请输入大写 X）
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 mt-auto">
            <PrimaryButton
              label="前往登录"
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
