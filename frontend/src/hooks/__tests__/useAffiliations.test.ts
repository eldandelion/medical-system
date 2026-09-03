import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useSchools,
  useSchoolDepartments,
  useHospitals,
  useHospitalDepartments,
  FALLBACK_SCHOOLS,
  FALLBACK_SCHOOL_DEPARTMENTS,
  FALLBACK_HOSPITALS,
  FALLBACK_HOSPITAL_DEPARTMENTS,
} from '../useAffiliations';

describe('useAffiliations Hooks', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  it('provides fallback schools and hospitals', () => {
    expect(FALLBACK_SCHOOLS.length).toBeGreaterThanOrEqual(6);
    expect(FALLBACK_SCHOOLS[0].name).toBe('中南大学');

    expect(FALLBACK_HOSPITALS.length).toBeGreaterThanOrEqual(6);
    expect(FALLBACK_HOSPITALS[0].name).toBe('中南大学湘雅医院');

    expect(FALLBACK_SCHOOL_DEPARTMENTS.length).toBeGreaterThanOrEqual(10);
    expect(FALLBACK_HOSPITAL_DEPARTMENTS.length).toBeGreaterThanOrEqual(6);
  });

  it('renders useSchools hook with fallback data immediately', () => {
    const { result } = renderHook(() => useSchools(), { wrapper: createWrapper() });
    expect(result.current.schools).toBeDefined();
    expect(result.current.schools.length).toBeGreaterThanOrEqual(6);
    expect(result.current.schools[0].name).toBe('中南大学');
  });

  it('renders useSchoolDepartments hook with fallback data', () => {
    const { result } = renderHook(() => useSchoolDepartments(1), { wrapper: createWrapper() });
    expect(result.current.departments).toBeDefined();
    expect(result.current.departments.length).toBeGreaterThanOrEqual(1);
  });

  it('renders useHospitals hook with fallback data immediately', () => {
    const { result } = renderHook(() => useHospitals(), { wrapper: createWrapper() });
    expect(result.current.hospitals).toBeDefined();
    expect(result.current.hospitals.length).toBeGreaterThanOrEqual(6);
    expect(result.current.hospitals[0].name).toBe('中南大学湘雅医院');
  });

  it('renders useHospitalDepartments hook with fallback data', () => {
    const { result } = renderHook(() => useHospitalDepartments(1), { wrapper: createWrapper() });
    expect(result.current.departments).toBeDefined();
    expect(result.current.departments.length).toBeGreaterThanOrEqual(1);
  });
});
