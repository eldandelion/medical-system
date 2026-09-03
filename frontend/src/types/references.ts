export type ReferenceCategory =
  | 'SCHOOL'
  | 'COLLEGE'
  | 'MAJOR'
  | 'SCHOOL_DEPARTMENT'
  | 'HOSPITAL'
  | 'HOSPITAL_DEPARTMENT'
  | 'ETHNICITY'
  | 'DEGREE_LEVEL';

export type ReferenceDataStatus = 'ACTIVE' | 'DEPRECATED';

export type ReferenceSubjectType =
  | 'STUDENT'
  | 'TEACHER'
  | 'HEAD_COUNSELLOR'
  | 'TRIAL_ADMIN'
  | 'DOCTOR'
  | 'REFERRAL'
  | 'MAJOR'
  | 'HOSPITAL_DEPARTMENT'
  | 'SCHOOL_DEPARTMENT';

export interface SchoolDto {
  id: number;
  name: string;
  status: ReferenceDataStatus;
  departmentCount: number;
  studentCount: number;
}

export interface CollegeDto {
  id: number;
  name: string;
  status: ReferenceDataStatus;
  majorCount: number;
  teacherCount: number;
}

export interface MajorDto {
  id: number;
  name: string;
  collegeId: number;
  collegeName: string;
  status: ReferenceDataStatus;
  studentCount: number;
}

export interface SchoolDepartmentDto {
  id: number;
  name: string;
  schoolId: number;
  schoolName: string;
  status: ReferenceDataStatus;
  staffCount: number;
}

export interface AdminHospitalDto {
  id: number;
  name: string;
  address?: string | null;
  contactPhone?: string | null;
  status: ReferenceDataStatus;
  departmentCount: number;
  activeReferralCount: number;
}

export interface HospitalDepartmentDto {
  id: number;
  name: string;
  hospitalId: number;
  hospitalName: string;
  status: ReferenceDataStatus;
  doctorCount: number;
}

export interface EthnicityDto {
  id: number;
  name: string;
  status: ReferenceDataStatus;
  studentCount: number;
}

export interface DegreeLevelDto {
  id: number;
  name: string;
  status: ReferenceDataStatus;
  studentCount: number;
}

export type AnyReferenceItem =
  | SchoolDto
  | CollegeDto
  | MajorDto
  | SchoolDepartmentDto
  | AdminHospitalDto
  | HospitalDepartmentDto
  | EthnicityDto
  | DegreeLevelDto;

export interface ReferenceDependencyItemDto {
  subjectType: ReferenceSubjectType;
  count: number;
}

export interface ReferenceDependencyCheckDto {
  targetId: number;
  category: ReferenceCategory;
  canHardDelete: boolean;
  totalReferences: number;
  dependencies: ReferenceDependencyItemDto[];
}

export interface ReferenceImportRowDto {
  rowNumber: number;
  status: 'READY' | 'DUPLICATE' | 'INVALID';
  name: string;
  parentName?: string | null;
  address?: string | null;
  contactPhone?: string | null;
  errorCode?: string | null;
}

export interface ReferenceImportPreviewDto {
  category: ReferenceCategory;
  totalRows: number;
  readyCount: number;
  duplicateCount: number;
  invalidCount: number;
  rows: ReferenceImportRowDto[];
}

export interface ReferenceImportCommitRequestDto {
  category: ReferenceCategory;
  rows: ReferenceImportRowDto[];
  overwriteDuplicates?: boolean;
}

export interface ReferenceImportResultDto {
  category: ReferenceCategory;
  totalProcessed: number;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  failedRows: ReferenceImportRowDto[];
}

export interface CategoryMeta {
  key: ReferenceCategory;
  title: string;
  singularTitle: string;
  icon: string;
  description: string;
  hasParent: boolean;
  parentLabel?: string;
}

export const REFERENCE_CATEGORIES: CategoryMeta[] = [
  {
    key: 'SCHOOL',
    title: '学校管理',
    singularTitle: '学校',
    icon: 'account_balance',
    description: '学校基本信息及多校区/直属高校单位',
    hasParent: false,
  },
  {
    key: 'COLLEGE',
    title: '学院管理',
    singularTitle: '学院',
    icon: 'school',
    description: '全校开设的二级学院与教学单位',
    hasParent: false,
  },
  {
    key: 'MAJOR',
    title: '专业管理',
    singularTitle: '专业',
    icon: 'menu_book',
    description: '各学院下属本硕博招生与培养专业',
    hasParent: true,
    parentLabel: '所属学院',
  },
  {
    key: 'SCHOOL_DEPARTMENT',
    title: '学校部门',
    singularTitle: '部门',
    icon: 'domain',
    description: '学校行政机关、心理健康教育中心等机构',
    hasParent: false,
  },
  {
    key: 'HOSPITAL',
    title: '合作医院',
    singularTitle: '医院',
    icon: 'local_hospital',
    description: '定点绿色通道转诊合作医疗机构',
    hasParent: false,
  },
  {
    key: 'HOSPITAL_DEPARTMENT',
    title: '医院科室',
    singularTitle: '科室',
    icon: 'medical_services',
    description: '合作医院精神科、临床心理科等专科科室',
    hasParent: true,
    parentLabel: '所属医院',
  },
  {
    key: 'ETHNICITY',
    title: '民族字典',
    singularTitle: '民族',
    icon: 'public',
    description: '国家标准56个民族及其他国籍分类',
    hasParent: false,
  },
  {
    key: 'DEGREE_LEVEL',
    title: '培养层次',
    singularTitle: '培养层次',
    icon: 'workspace_premium',
    description: '本科生、硕士研究生、博士研究生等学制层次',
    hasParent: false,
  },
];

export const SUBJECT_TYPE_LABELS: Record<ReferenceSubjectType, string> = {
  STUDENT: '名学生档案',
  TEACHER: '名教师/导师',
  HEAD_COUNSELLOR: '名心理中心教师',
  TRIAL_ADMIN: '名医院对接员',
  DOCTOR: '名专科医生',
  REFERRAL: '条转诊记录',
  MAJOR: '个下属专业',
  HOSPITAL_DEPARTMENT: '个下属科室',
  SCHOOL_DEPARTMENT: '个下属部门',
};
