import { useState, useEffect, useCallback } from 'react';
import { UserRole } from '../../types';

export interface RegistrationFormData {
  role?: UserRole;
  name: string;
  gender: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  ethnicity: string;
  school: string;
  department: string;
  hospital: string;
  hospitalDepartment: string;
  workerNumber: string;
  idCardNumber: string;
  email: string;
  emailOtp: string;
  password: string;
  confirmPassword: string;
}

export const INITIAL_REGISTRATION_DATA: RegistrationFormData = {
  role: undefined,
  name: '',
  gender: '',
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  ethnicity: '汉族',
  school: '中南大学',
  department: '',
  hospital: '中南大学湘雅医院',
  hospitalDepartment: '',
  workerNumber: '',
  idCardNumber: '',
  email: '',
  emailOtp: '',
  password: '',
  confirmPassword: '',
};

const DRAFT_STORAGE_KEY = 'medical_system_reg_draft';

export function useRegistrationDraft() {
  const [formData, setFormData] = useState<RegistrationFormData>(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_REGISTRATION_DATA,
          ...parsed,
          // Never restore sensitive credentials from storage
          password: '',
          confirmPassword: '',
          emailOtp: '',
        };
      }
    } catch (e) {
      console.warn('Failed to restore registration draft from sessionStorage', e);
    }
    return INITIAL_REGISTRATION_DATA;
  });

  // Save non-sensitive draft on change
  useEffect(() => {
    try {
      const sanitizedDraft: Partial<RegistrationFormData> = {
        role: formData.role,
        name: formData.name,
        gender: formData.gender,
        birthYear: formData.birthYear,
        birthMonth: formData.birthMonth,
        birthDay: formData.birthDay,
        ethnicity: formData.ethnicity,
        school: formData.school,
        department: formData.department,
        hospital: formData.hospital,
        hospitalDepartment: formData.hospitalDepartment,
        workerNumber: formData.workerNumber,
        idCardNumber: formData.idCardNumber,
        email: formData.email,
      };
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(sanitizedDraft));
    } catch (e) {
      console.warn('Failed to save registration draft to sessionStorage', e);
    }
  }, [formData]);

  const updateFormData = useCallback((fields: Partial<RegistrationFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  }, []);

  const clearDraft = useCallback(() => {
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear registration draft from sessionStorage', e);
    }
    setFormData(INITIAL_REGISTRATION_DATA);
  }, []);

  return {
    formData,
    setFormData,
    updateFormData,
    clearDraft,
  };
}
