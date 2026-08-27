import * as React from 'react';
import { motion } from 'motion/react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';
import { CsuLogo } from './LoginOverlay';

export const DEFAULT_SCHOOL_OPTIONS = [
  '中南大学',
  '湖南大学',
  '湖南师范大学',
  '长沙理工大学',
  '中南林业科技大学',
  '其他高校',
];

export const DEFAULT_DEPARTMENT_OPTIONS = [
  '心理健康教育与咨询中心',
  '学生工作部（处）',
  '教务处',
  '计算机学院',
  '湘雅医学院',
  '工程学院',
  '商学院',
  '文学院',
  '外国语学院',
  '数学与统计学院',
  '物理与电子学院',
  '化学化工学院',
  '法学院',
  '马克思主义学院',
  '医院分诊部',
  '其他部门',
];

export interface RegisterAffiliationData {
  school: string;
  department: string;
  workerNumber: string;
}

export interface RegisterAffiliationProps {
  initialData?: Partial<RegisterAffiliationData>;
  onBack: () => void;
  onProceed: (data: RegisterAffiliationData) => void;
  isLoading?: boolean;
}

export function RegisterAffiliation({
  initialData,
  onBack,
  onProceed,
  isLoading = false,
}: RegisterAffiliationProps) {
  const [school, setSchool] = React.useState(initialData?.school !== undefined ? initialData.school : '中南大学');
  const [department, setDepartment] = React.useState(initialData?.department || '');
  const [workerNumber, setWorkerNumber] = React.useState(initialData?.workerNumber || '');

  const [schoolError, setSchoolError] = React.useState('');
  const [departmentError, setDepartmentError] = React.useState('');
  const [workerNumberError, setWorkerNumberError] = React.useState('');

  const handleSubmit = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    let hasError = false;

    if (!school.trim()) {
      setSchoolError('请选择所属学校');
      hasError = true;
    } else {
      setSchoolError('');
    }

    if (!department.trim()) {
      setDepartmentError('请选择所属部门');
      hasError = true;
    } else {
      setDepartmentError('');
    }

    const trimmedWorkerNumber = workerNumber.trim();
    if (!trimmedWorkerNumber) {
      setWorkerNumberError('请输入工号');
      hasError = true;
    } else {
      setWorkerNumberError('');
    }

    if (hasError) return;

    onProceed({
      school: school.trim(),
      department: department.trim(),
      workerNumber: trimmedWorkerNumber,
    });
  };

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
            基本信息
          </h1>
          <p className="text-[15px] sm:text-[16px] leading-[24px] text-[var(--md-sys-color-on-surface-variant)] mt-2.5 font-normal">
            选择您的所属学校与部门，并输入工号
          </p>
        </div>
      </div>

      {/* Right Column: School, Department & Worker Number Inputs */}
      <div className="flex flex-col justify-between h-full">
        {/* Alignment spacer on desktop */}
        <div className="hidden md:flex h-[32px] items-center" />

        <div className="mt-0 md:mt-6 flex flex-col justify-between flex-1">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-between h-full space-y-6"
          >
            <div className="space-y-4">
              {/* School Selector */}
              <div>
                <md-outlined-select
                  label="学校"
                  className="w-full"
                  value={school}
                  error={!!schoolError || undefined}
                  onChange={(e: React.SyntheticEvent) => {
                    const target = e.target as HTMLSelectElement;
                    setSchool(target.value);
                    if (schoolError) setSchoolError('');
                  }}
                >
                  {DEFAULT_SCHOOL_OPTIONS.map((s) => (
                    <md-select-option key={s} value={s}>
                      <div slot="headline">{s}</div>
                    </md-select-option>
                  ))}
                </md-outlined-select>
                {schoolError && (
                  <div className="text-xs text-[var(--md-sys-color-error)] flex items-center gap-1 pt-1.5">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>{schoolError}</span>
                  </div>
                )}
              </div>

              {/* Department Selector */}
              <div>
                <md-outlined-select
                  label="部门"
                  className="w-full"
                  value={department}
                  error={!!departmentError || undefined}
                  onChange={(e: React.SyntheticEvent) => {
                    const target = e.target as HTMLSelectElement;
                    setDepartment(target.value);
                    if (departmentError) setDepartmentError('');
                  }}
                >
                  {DEFAULT_DEPARTMENT_OPTIONS.map((dept) => (
                    <md-select-option key={dept} value={dept}>
                      <div slot="headline">{dept}</div>
                    </md-select-option>
                  ))}
                </md-outlined-select>
                {departmentError && (
                  <div className="text-xs text-[var(--md-sys-color-error)] flex items-center gap-1 pt-1.5">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>{departmentError}</span>
                  </div>
                )}
              </div>

              {/* Worker Number Input */}
              <div>
                <md-outlined-text-field
                  label="工号"
                  value={workerNumber}
                  className="w-full"
                  error={!!workerNumberError}
                  onInput={(e: React.SyntheticEvent) => {
                    const target = e.target as HTMLInputElement;
                    setWorkerNumber(target.value);
                    if (workerNumberError) setWorkerNumberError('');
                  }}
                />
                {workerNumberError && (
                  <div className="text-xs text-[var(--md-sys-color-error)] flex items-center gap-1 pt-1.5">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>{workerNumberError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 mt-auto">
              <TertiaryButton
                label="返回"
                onClick={onBack}
                noCollapse
              />
              <PrimaryButton
                label={isLoading ? "处理中..." : "下一步"}
                onClick={handleSubmit}
                disabled={isLoading}
                noCollapse
                className="px-6 rounded-full"
              />
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
