import { useQuery } from '@tanstack/react-query';
import {
  dictionaryApi,
  type SchoolDto,
  type SchoolDepartmentDto,
  type HospitalSummaryDto,
  type HospitalDepartmentDto,
} from '../api/dictionaries';

export const FALLBACK_SCHOOLS: SchoolDto[] = [
  { id: 1, name: '中南大学' },
  { id: 2, name: '湖南大学' },
  { id: 3, name: '湖南师范大学' },
  { id: 4, name: '长沙理工大学' },
  { id: 5, name: '中南林业科技大学' },
  { id: 6, name: '其他高校' },
];

export const FALLBACK_SCHOOL_DEPARTMENTS: SchoolDepartmentDto[] = [
  { id: 1, name: '心理健康教育与咨询中心', schoolId: 1 },
  { id: 2, name: '咨询中心', schoolId: 1 },
  { id: 3, name: '学生工作部（处）', schoolId: 1 },
  { id: 4, name: '教务处', schoolId: 1 },
  { id: 5, name: '计算机学院', schoolId: 1 },
  { id: 6, name: '湘雅医学院', schoolId: 1 },
  { id: 7, name: '工程学院', schoolId: 1 },
  { id: 8, name: '商学院', schoolId: 1 },
  { id: 9, name: '文学院', schoolId: 1 },
  { id: 10, name: '外国语学院', schoolId: 1 },
  { id: 11, name: '数学与统计学院', schoolId: 1 },
  { id: 12, name: '物理与电子学院', schoolId: 1 },
  { id: 13, name: '化学化工学院', schoolId: 1 },
  { id: 14, name: '法学院', schoolId: 1 },
  { id: 15, name: '马克思主义学院', schoolId: 1 },
  { id: 16, name: '其他部门', schoolId: 1 },
];

export const FALLBACK_HOSPITALS: HospitalSummaryDto[] = [
  { id: 1, name: '中南大学湘雅医院', address: '湖南省长沙市开福区湘雅路87号', contactPhone: '0731-84328888' },
  { id: 2, name: '中南大学湘雅二医院', address: '湖南省长沙市芙蓉区人民中路139号', contactPhone: '0731-85295888' },
  { id: 3, name: '中南大学湘雅三医院', address: '湖南省长沙市岳麓区桐梓坡路138号', contactPhone: '0731-88618888' },
  { id: 4, name: '湖南省人民医院', address: '湖南省长沙市芙蓉区解放西路61号', contactPhone: '0731-83929114' },
  { id: 5, name: '湖南省脑科医院（湖南省第二人民医院）', address: '湖南省长沙市雨花区芙蓉中路三段427号', contactPhone: '0731-85232233' },
  { id: 6, name: '其他医疗机构', address: '其他地区', contactPhone: '0731-80000000' },
];

export const FALLBACK_HOSPITAL_DEPARTMENTS: HospitalDepartmentDto[] = [
  { id: 1, name: '心理咨询科', hospitalId: 1 },
  { id: 2, name: '精神科', hospitalId: 1 },
  { id: 3, name: '临床心理科', hospitalId: 1 },
  { id: 4, name: '心身医学科', hospitalId: 1 },
  { id: 5, name: '门诊分诊部', hospitalId: 1 },
  { id: 6, name: '急诊科', hospitalId: 1 },
  { id: 7, name: '神经内科', hospitalId: 1 },
  { id: 8, name: '内科', hospitalId: 1 },
  { id: 9, name: '其他科室', hospitalId: 1 },
];

export function useSchools() {
  const query = useQuery({
    queryKey: ['dictionaries', 'schools'],
    queryFn: dictionaryApi.fetchSchools,
    placeholderData: FALLBACK_SCHOOLS,
    staleTime: Infinity,
  });

  return {
    schools: query.data ?? FALLBACK_SCHOOLS,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
}

export function useSchoolDepartments(schoolId?: number) {
  const query = useQuery({
    queryKey: ['dictionaries', 'school-departments', schoolId],
    queryFn: () => dictionaryApi.fetchSchoolDepartments(schoolId),
    placeholderData: FALLBACK_SCHOOL_DEPARTMENTS,
    staleTime: Infinity,
  });

  return {
    departments: query.data ?? FALLBACK_SCHOOL_DEPARTMENTS,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
}

export function useHospitals() {
  const query = useQuery({
    queryKey: ['dictionaries', 'hospitals'],
    queryFn: dictionaryApi.fetchHospitals,
    placeholderData: FALLBACK_HOSPITALS,
    staleTime: Infinity,
  });

  return {
    hospitals: query.data ?? FALLBACK_HOSPITALS,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
}

export function useHospitalDepartments(hospitalId?: number) {
  const query = useQuery({
    queryKey: ['dictionaries', 'hospital-departments', hospitalId],
    queryFn: () => dictionaryApi.fetchHospitalDepartments(hospitalId),
    placeholderData: FALLBACK_HOSPITAL_DEPARTMENTS,
    staleTime: Infinity,
  });

  return {
    departments: query.data ?? FALLBACK_HOSPITAL_DEPARTMENTS,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
}
