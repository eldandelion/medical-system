import { apiFetch } from './client';

export interface EthnicityDto {
  id: number;
  name: string;
}

export interface SchoolDto {
  id: number;
  name: string;
}

export interface SchoolDepartmentDto {
  id: number;
  name: string;
  schoolId: number;
}

export interface HospitalSummaryDto {
  id: number;
  name: string;
  address?: string | null;
  contactPhone?: string | null;
}

export interface HospitalDepartmentDto {
  id: number;
  name: string;
  hospitalId: number;
}

export const dictionaryApi = {
  fetchEthnicities: async (): Promise<EthnicityDto[]> => {
    return apiFetch<EthnicityDto[]>('/api/dictionaries/ethnicities');
  },
  fetchSchools: async (): Promise<SchoolDto[]> => {
    return apiFetch<SchoolDto[]>('/api/dictionaries/schools');
  },
  fetchSchoolDepartments: async (schoolId?: number): Promise<SchoolDepartmentDto[]> => {
    const url = schoolId != null
      ? `/api/dictionaries/school-departments?schoolId=${schoolId}`
      : '/api/dictionaries/school-departments';
    return apiFetch<SchoolDepartmentDto[]>(url);
  },
  fetchHospitals: async (): Promise<HospitalSummaryDto[]> => {
    return apiFetch<HospitalSummaryDto[]>('/api/dictionaries/hospitals');
  },
  fetchHospitalDepartments: async (hospitalId?: number): Promise<HospitalDepartmentDto[]> => {
    const url = hospitalId != null
      ? `/api/dictionaries/hospital-departments?hospitalId=${hospitalId}`
      : '/api/dictionaries/hospital-departments';
    return apiFetch<HospitalDepartmentDto[]>(url);
  },
};
