import * as React from 'react';
import { motion } from 'motion/react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';
import { CsuLogo } from './LoginOverlay';
import { type RegisterRole } from './RegisterRoleSelect';
import { validateWorkerNumber } from './validationUtils';
import {
  useSchools,
  useSchoolDepartments,
  useHospitals,
  useHospitalDepartments,
  FALLBACK_SCHOOLS,
  FALLBACK_SCHOOL_DEPARTMENTS,
  FALLBACK_HOSPITALS,
  FALLBACK_HOSPITAL_DEPARTMENTS,
} from '../../hooks/useAffiliations';

export const DEFAULT_SCHOOL_OPTIONS = FALLBACK_SCHOOLS.map((s) => s.name);
export const DEFAULT_DEPARTMENT_OPTIONS = FALLBACK_SCHOOL_DEPARTMENTS.map((d) => d.name);
export const DEFAULT_HOSPITAL_OPTIONS = FALLBACK_HOSPITALS.map((h) => h.name);
export const DEFAULT_HOSPITAL_DEPARTMENT_OPTIONS = FALLBACK_HOSPITAL_DEPARTMENTS.map((d) => d.name);

export interface RegisterAffiliationData {
  school?: string;
  schoolId?: number;
  department?: string;
  departmentId?: number;
  hospital?: string;
  hospitalId?: number;
  hospitalDepartment?: string;
  hospitalDepartmentId?: number;
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

  const { schools } = useSchools();
  const { hospitals } = useHospitals();

  const selectedSchool = schools.find((s) => s.name === institution);
  const selectedHospital = hospitals.find((h) => h.name === institution);

  const { departments: schoolDepts } = useSchoolDepartments(selectedSchool?.id);
  const { departments: hospitalDepts } = useHospitalDepartments(selectedHospital?.id);

  const institutionLabel = isHospitalRole ? '医院' : '学校';
  const departmentLabel = isHospitalRole ? '科室' : '部门';
  const institutionList = isHospitalRole ? hospitals : schools;
  const departmentList = isHospitalRole ? hospitalDepts : schoolDepts;

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
      const matchedDept = hospitalDepts.find((d) => d.name === department.trim());
      onProceed({
        hospital: institution.trim(),
        hospitalId: selectedHospital?.id,
        hospitalDepartment: department.trim(),
        hospitalDepartmentId: matchedDept?.id,
        department: department.trim(),
        departmentId: matchedDept?.id,
        workerNumber: workerNumber.trim(),
      });
    } else {
      const matchedDept = schoolDepts.find((d) => d.name === department.trim());
      onProceed({
        school: institution.trim(),
        schoolId: selectedSchool?.id,
        department: department.trim(),
        departmentId: matchedDept?.id,
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
                    const nextVal = target.value;
                    setInstitution(nextVal);
                    setDepartment('');
                    if (institutionError) setInstitutionError('');
                    if (departmentError) setDepartmentError('');
                  }}
                >
                  {institutionList.map((item) => (
                    <md-select-option key={item.id} value={item.name}>
                      <div slot="headline">{item.name}</div>
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
                  {departmentList.map((dept) => (
                    <md-select-option key={dept.id} value={dept.name}>
                      <div slot="headline">{dept.name}</div>
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
