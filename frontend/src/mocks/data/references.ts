import {
  CollegeDto,
  MajorDto,
  SchoolDepartmentDto,
  AdminHospitalDto,
  HospitalDepartmentDto,
  EthnicityDto,
  DegreeLevelDto,
} from '../../types/references';

export const mockCollegesDb: CollegeDto[] = [
  { id: 1, name: '计算机与通信工程学院', status: 'ACTIVE', majorCount: 4, teacherCount: 18 },
  { id: 2, name: '土木工程学院', status: 'ACTIVE', majorCount: 3, teacherCount: 12 },
  { id: 3, name: '经济与管理学院', status: 'ACTIVE', majorCount: 5, teacherCount: 22 },
  { id: 4, name: '外国语学院', status: 'ACTIVE', majorCount: 2, teacherCount: 8 },
  { id: 5, name: '历史与文化学院 (已并入文学院)', status: 'DEPRECATED', majorCount: 1, teacherCount: 0 },
];

export const mockMajorsDb: MajorDto[] = [
  { id: 1, name: '计算机科学与技术', collegeId: 1, collegeName: '计算机与通信工程学院', status: 'ACTIVE', studentCount: 142 },
  { id: 2, name: '软件工程', collegeId: 1, collegeName: '计算机与通信工程学院', status: 'ACTIVE', studentCount: 120 },
  { id: 3, name: '土木工程', collegeId: 2, collegeName: '土木工程学院', status: 'ACTIVE', studentCount: 98 },
  { id: 4, name: '工商管理', collegeId: 3, collegeName: '经济与管理学院', status: 'ACTIVE', studentCount: 86 },
  { id: 5, name: '英语', collegeId: 4, collegeName: '外国语学院', status: 'ACTIVE', studentCount: 64 },
  { id: 6, name: '古典文献学', collegeId: 5, collegeName: '历史与文化学院 (已并入文学院)', status: 'DEPRECATED', studentCount: 0 },
];

export const mockSchoolDepartmentsDb: SchoolDepartmentDto[] = [
  { id: 1, name: '学生工作处 (部)', schoolId: 1, schoolName: '中南大学', status: 'ACTIVE', staffCount: 14 },
  { id: 2, name: '心理健康教育与咨询中心', schoolId: 1, schoolName: '中南大学', status: 'ACTIVE', staffCount: 8 },
  { id: 3, name: '校团委', schoolId: 1, schoolName: '中南大学', status: 'ACTIVE', staffCount: 6 },
  { id: 4, name: '后勤保障部', schoolId: 1, schoolName: '中南大学', status: 'ACTIVE', staffCount: 20 },
  { id: 5, name: '临时隔离管控中心 (已撤销)', schoolId: 1, schoolName: '中南大学', status: 'DEPRECATED', staffCount: 0 },
];

export const mockAdminHospitalsDb: AdminHospitalDto[] = [
  {
    id: 1,
    name: '中南大学湘雅二医院',
    address: '湖南省长沙市人民中路139号',
    contactPhone: '0731-85295888',
    status: 'ACTIVE',
    departmentCount: 3,
    activeReferralCount: 12,
  },
  {
    id: 2,
    name: '湖南省脑科医院 (湖南省第二人民医院)',
    address: '湖南省长沙市芙蓉中路三段427号',
    contactPhone: '0731-85232209',
    status: 'ACTIVE',
    departmentCount: 2,
    activeReferralCount: 7,
  },
  {
    id: 3,
    name: '旧定点合作诊所 (已终止合作)',
    address: '长沙市岳麓区大学城西路12号',
    contactPhone: '0731-88880000',
    status: 'DEPRECATED',
    departmentCount: 1,
    activeReferralCount: 0,
  },
];

export const mockHospitalDepartmentsDb: HospitalDepartmentDto[] = [
  { id: 1, name: '临床心理科', hospitalId: 1, hospitalName: '中南大学湘雅二医院', status: 'ACTIVE', doctorCount: 6 },
  { id: 2, name: '精神科专家门诊', hospitalId: 1, hospitalName: '中南大学湘雅二医院', status: 'ACTIVE', doctorCount: 4 },
  { id: 3, name: '心身医学科', hospitalId: 2, hospitalName: '湖南省脑科医院 (湖南省第二人民医院)', status: 'ACTIVE', doctorCount: 5 },
  { id: 4, name: '儿少心理科', hospitalId: 2, hospitalName: '湖南省脑科医院 (湖南省第二人民医院)', status: 'ACTIVE', doctorCount: 3 },
  { id: 5, name: '心理测评室 (已整合)', hospitalId: 3, hospitalName: '旧定点合作诊所 (已终止合作)', status: 'DEPRECATED', doctorCount: 0 },
];

export const mockEthnicitiesDb: EthnicityDto[] = [
  { id: 1, name: '汉族', status: 'ACTIVE', studentCount: 1240 },
  { id: 2, name: '壮族', status: 'ACTIVE', studentCount: 32 },
  { id: 3, name: '回族', status: 'ACTIVE', studentCount: 28 },
  { id: 4, name: '维吾尔族', status: 'ACTIVE', studentCount: 14 },
  { id: 5, name: '苗族', status: 'ACTIVE', studentCount: 19 },
  { id: 6, name: '测试停用民族', status: 'DEPRECATED', studentCount: 0 },
];

export const mockDegreeLevelsDb: DegreeLevelDto[] = [
  { id: 1, name: '本科生', status: 'ACTIVE', studentCount: 1100 },
  { id: 2, name: '硕士研究生', status: 'ACTIVE', studentCount: 220 },
  { id: 3, name: '博士研究生', status: 'ACTIVE', studentCount: 55 },
  { id: 4, name: '预科生 (旧制)', status: 'DEPRECATED', studentCount: 0 },
];
