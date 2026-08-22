import * as React from 'react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';

export interface ProfileAcademicViewProps {
  idLabel?: string;
  studentId: string;
  school: string;
  major: string;
  academicYear: string;
  onSave: (data: { studentId: string; school: string; major: string; academicYear: string }) => void;
  onCancel?: () => void;
}

export function ProfileAcademicView({
  idLabel = '学号',
  studentId = '2021001',
  school = '中南大学',
  major = '计算机科学与技术',
  academicYear = '大三 (2023级)',
  onSave,
  onCancel,
}: ProfileAcademicViewProps) {
  const [currentStudentId, setCurrentStudentId] = React.useState(studentId);
  const [currentSchool, setCurrentSchool] = React.useState(school);
  const [currentMajor, setCurrentMajor] = React.useState(major);
  const [currentAcademicYear, setCurrentAcademicYear] = React.useState(academicYear);

  const handleSave = () => {
    onSave({
      studentId: currentStudentId.trim() || studentId,
      school: currentSchool.trim() || school,
      major: currentMajor.trim() || major,
      academicYear: currentAcademicYear.trim() || academicYear,
    });
  };

  return (
    <div className="max-w-2xl w-full mx-auto p-6 md:p-10 space-y-6">
      <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed px-1">
        学籍与所属单位信息用于系统权限匹配、通知下发及心理健康服务分发。{' '}
        <a href="#learn-more" onClick={(e) => e.preventDefault()} className="text-[var(--md-sys-color-primary)] hover:underline font-medium">
          了解详情
        </a>
      </p>

      <div className="bg-[var(--md-sys-color-surface)] rounded-xl p-6 border border-[var(--md-sys-color-outline-variant)] space-y-6">
        <h2 className="text-lg font-medium text-[var(--md-sys-color-on-surface)]">
          学籍与就读信息
        </h2>

        <div className="space-y-4">
          <md-outlined-text-field
            label={idLabel}
            placeholder={idLabel === '学号' ? '例如：2021001' : '例如：TEA-2023001'}
            className="w-full"
            value={currentStudentId}
            onInput={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLInputElement;
              setCurrentStudentId(target.value);
            }}
          >
            <md-icon slot="leading-icon">numbers</md-icon>
          </md-outlined-text-field>

          <md-outlined-text-field
            label="所属院校 / 学校"
            placeholder="例如：中南大学"
            className="w-full"
            value={currentSchool}
            onInput={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLInputElement;
              setCurrentSchool(target.value);
            }}
          >
            <md-icon slot="leading-icon">account_balance</md-icon>
          </md-outlined-text-field>

          <md-outlined-text-field
            label="就读专业"
            placeholder="例如：计算机科学与技术"
            className="w-full"
            value={currentMajor}
            onInput={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLInputElement;
              setCurrentMajor(target.value);
            }}
          >
            <md-icon slot="leading-icon">menu_book</md-icon>
          </md-outlined-text-field>

          <md-outlined-text-field
            label="年级 / 届别"
            placeholder="例如：大三 (2023级)"
            className="w-full"
            value={currentAcademicYear}
            onInput={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLInputElement;
              setCurrentAcademicYear(target.value);
            }}
          >
            <md-icon slot="leading-icon">school</md-icon>
          </md-outlined-text-field>
        </div>

        {/* Privacy Note */}
        <div className="pt-2 border-t border-[var(--md-sys-color-outline-variant)] border-opacity-30">
          <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2">
            谁可以看到您的信息
          </h3>
          <div className="flex items-start gap-3 text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">school</span>
            <span>
              您的学籍或工号信息对系统管理员、所属院系指导人员及心理健康中心授权人员可见。
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--md-sys-color-outline-variant)] border-opacity-40">
          {onCancel && (
            <TertiaryButton
              label="取消"
              onClick={onCancel}
              className="h-10 px-5"
            />
          )}
          <PrimaryButton
            label="保存"
            onClick={handleSave}
            className="h-10 px-6"
          />
        </div>
      </div>
    </div>
  );
}
