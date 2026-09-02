import * as React from 'react';
import { motion } from 'motion/react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';
import { CsuLogo } from './LoginOverlay';
import { type RegisterRole } from './RegisterRoleSelect';
import { validateWorkerNumber } from './validationUtils';

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
  '其他部门',
];

export const DEFAULT_HOSPITAL_OPTIONS = [
  '中南大学湘雅医院',
  '中南大学湘雅二医院',
  '中南大学湘雅三医院',
  '湖南省人民医院',
  '湖南省脑科医院（湖南省第二人民医院）',
  '其他医疗机构',
];

export const DEFAULT_HOSPITAL_DEPARTMENT_OPTIONS = [
  '心理咨询科',
  '精神科',
  '临床心理科',
  '心身医学科',
  '门诊分诊部',
  '急诊科',
  '神经内科',
  '其他科室',
];

export interface RegisterAffiliationData {
  school?: string;
  department?: string;
  hospital?: string;
  hospitalDepartment?: string;
  workerNumber: string;
}

export interface RegisterAffiliationProps {
  role?: RegisterRole | null;
  initialData?: Partial<RegisterAffiliationData>;
  onBack: () => void;
  onProceed: (data: RegisterAffiliationData) => void;
  isLoading?: boolean;
}

export function RegisterAffiliation({
  role,
  initialData,
  onBack,
  onProceed,
  isLoading = false,
}: RegisterAffiliationProps) {
  const isHospitalRole = role === 'trial-admin' || role === 'doctor';

  const defaultInstitution = isHospitalRole ? '中南大学湘雅医院' : '中南大学';
  const initialInstitution = isHospitalRole
    ? (initialData?.hospital !== undefined ? initialData.hospital : defaultInstitution)
    : (initialData?.school !== undefined ? initialData.school : defaultInstitution);

  const initialDept = isHospitalRole
    ? (initialData?.hospitalDepartment || initialData?.department || '')
    : (initialData?.department || '');

  const [institution, setInstitution] = React.useState(initialInstitution);
  const [department, setDepartment] = React.useState(initialDept);
  const [workerNumber, setWorkerNumber] = React.useState(initialData?.workerNumber || '');

  const [institutionError, setInstitutionError] = React.useState('');
  const [departmentError, setDepartmentError] = React.useState('');
  const [workerNumberError, setWorkerNumberError] = React.useState('');

  const institutionLabel = isHospitalRole ? '医院' : '学校';
  const departmentLabel = isHospitalRole ? '科室' : '部门';
  const institutionOptions = isHospitalRole ? DEFAULT_HOSPITAL_OPTIONS : DEFAULT_SCHOOL_OPTIONS;
  const departmentOptions = isHospitalRole ? DEFAULT_HOSPITAL_DEPARTMENT_OPTIONS : DEFAULT_DEPARTMENT_OPTIONS;

  const subtitle = isHospitalRole
    ? '选择您的所属医院与科室，并输入工号'
    : '选择您的所属学校与部门，并输入工号';

  const handleSubmit = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    let hasError = false;

    if (!institution.trim()) {
      setInstitutionError(`请选择所属${institutionLabel}`);
      hasError = true;
    } else {
      setInstitutionError('');
    }

    if (!department.trim()) {
      setDepartmentError(`请选择所属${departmentLabel}`);
      hasError = true;
    } else {
      setDepartmentError('');
    }

    const workerValidation = validateWorkerNumber(workerNumber);
    if (!workerValidation.isValid) {
      setWorkerNumberError(workerValidation.error || '请输入工号');
      hasError = true;
    } else {
      setWorkerNumberError('');
    }

    if (hasError) return;

    if (isHospitalRole) {
      onProceed({
        hospital: institution.trim(),
        hospitalDepartment: department.trim(),
        department: department.trim(),
        workerNumber: workerNumber.trim(),
      });
    } else {
      onProceed({
        school: institution.trim(),
        department: department.trim(),
        workerNumber: workerNumber.trim(),
      });
    }
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
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Column: Institution, Department & Worker Number Inputs */}
      <div className="flex flex-col justify-between h-full">
        {/* Alignment spacer on desktop */}
        <div className="hidden md:flex h-[32px] items-center" />

        <div className="mt-0 md:mt-6 flex flex-col justify-between flex-1">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-between h-full space-y-6"
          >
            <div className="space-y-4">
              {/* Institution (School or Hospital) Selector */}
              <div>
                <md-outlined-select
                  label={institutionLabel}
                  className="w-full"
                  value={institution}
                  error={!!institutionError || undefined}
                  error-text={institutionError || undefined}
                  onChange={(e: React.SyntheticEvent) => {
                    const target = e.target as HTMLSelectElement;
                    setInstitution(target.value);
                    if (institutionError) setInstitutionError('');
                  }}
                >
                  {institutionOptions.map((opt) => (
                    <md-select-option key={opt} value={opt}>
                      <div slot="headline">{opt}</div>
                    </md-select-option>
                  ))}
                  {institutionError && <span slot="error-text">{institutionError}</span>}
                </md-outlined-select>
              </div>

              {/* Department (School Department or Hospital Department) Selector */}
              <div>
                <md-outlined-select
                  label={departmentLabel}
                  className="w-full"
                  value={department}
                  error={!!departmentError || undefined}
                  error-text={departmentError || undefined}
                  onChange={(e: React.SyntheticEvent) => {
                    const target = e.target as HTMLSelectElement;
                    setDepartment(target.value);
                    if (departmentError) setDepartmentError('');
                  }}
                >
                  {departmentOptions.map((dept) => (
                    <md-select-option key={dept} value={dept}>
                      <div slot="headline">{dept}</div>
                    </md-select-option>
                  ))}
                  {departmentError && <span slot="error-text">{departmentError}</span>}
                </md-outlined-select>
              </div>

              {/* Worker Number Input */}
              <div>
                <md-outlined-text-field
                  label="工号"
                  maxLength={30}
                  value={workerNumber}
                  className="w-full"
                  error={!!workerNumberError || undefined}
                  error-text={workerNumberError || undefined}
                  onInput={(e: React.SyntheticEvent) => {
                    const target = e.target as HTMLInputElement;
                    setWorkerNumber(target.value);
                    if (workerNumberError) setWorkerNumberError('');
                  }}
                >
                  {workerNumberError && <span slot="error-text">{workerNumberError}</span>}
                </md-outlined-text-field>
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
