import { apiFetch, apiUrl } from './client';
import {
  ReferenceCategory,
  AnyReferenceItem,
  ReferenceDependencyCheckDto,
  ReferenceImportPreviewDto,
  ReferenceImportCommitRequestDto,
  ReferenceImportResultDto,
} from '../types/references';

const CATEGORY_PATH_MAP: Record<ReferenceCategory, string> = {
  SCHOOL: 'schools',
  COLLEGE: 'colleges',
  MAJOR: 'majors',
  SCHOOL_DEPARTMENT: 'school-departments',
  HOSPITAL: 'hospitals',
  HOSPITAL_DEPARTMENT: 'hospital-departments',
  ETHNICITY: 'ethnicities',
  DEGREE_LEVEL: 'degree-levels',
};

export async function fetchReferences(
  category: ReferenceCategory,
  options: {
    query?: string;
    collegeId?: number;
    hospitalId?: number;
    includeDeprecated?: boolean;
    token?: string;
  } = {}
): Promise<AnyReferenceItem[]> {
  const path = CATEGORY_PATH_MAP[category];
  return apiFetch<AnyReferenceItem[]>(`/api/admin/references/${path}`, {
    token: options.token,
    params: {
      query: options.query || undefined,
      collegeId: options.collegeId || undefined,
      hospitalId: options.hospitalId || undefined,
      includeDeprecated: options.includeDeprecated ?? true,
    },
  });
}

export async function createReference(
  category: ReferenceCategory,
  data: Record<string, unknown>,
  token?: string
): Promise<AnyReferenceItem> {
  const path = CATEGORY_PATH_MAP[category];
  return apiFetch<AnyReferenceItem>(`/api/admin/references/${path}`, {
    method: 'POST',
    body: data,
    token,
  });
}

export async function updateReference(
  category: ReferenceCategory,
  id: number,
  data: Record<string, unknown>,
  token?: string
): Promise<AnyReferenceItem> {
  const path = CATEGORY_PATH_MAP[category];
  return apiFetch<AnyReferenceItem>(`/api/admin/references/${path}/${id}`, {
    method: 'PUT',
    body: data,
    token,
  });
}

export async function checkReferenceDependencies(
  category: ReferenceCategory,
  id: number,
  token?: string
): Promise<ReferenceDependencyCheckDto> {
  return apiFetch<ReferenceDependencyCheckDto>(`/api/admin/references/${category}/${id}/dependency-check`, {
    token,
  });
}

export async function deprecateReference(
  category: ReferenceCategory,
  id: number,
  token?: string
): Promise<AnyReferenceItem> {
  return apiFetch<AnyReferenceItem>(`/api/admin/references/${category}/${id}/deprecate`, {
    method: 'PATCH',
    token,
  });
}

export async function reactivateReference(
  category: ReferenceCategory,
  id: number,
  token?: string
): Promise<AnyReferenceItem> {
  return apiFetch<AnyReferenceItem>(`/api/admin/references/${category}/${id}/reactivate`, {
    method: 'PATCH',
    token,
  });
}

export async function deleteReference(
  category: ReferenceCategory,
  id: number,
  token?: string
): Promise<void> {
  return apiFetch<void>(`/api/admin/references/${category}/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function downloadReferenceTemplate(
  category: ReferenceCategory,
  token?: string
): Promise<void> {
  const url = apiUrl(`/api/admin/references/import/template/${category}`);
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error('下载导入模板失败');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${category.toLowerCase()}_import_template.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

export async function previewReferenceImport(
  category: ReferenceCategory,
  file: File,
  token?: string
): Promise<ReferenceImportPreviewDto> {
  const formData = new FormData();
  formData.append('category', category);
  formData.append('file', file);

  const url = apiUrl('/api/admin/references/import/preview');
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    let errorMsg = '解析导入文件失败';
    try {
      const errJson = await response.json();
      if (errJson?.error) errorMsg = errJson.error;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function commitReferenceImport(
  request: ReferenceImportCommitRequestDto,
  token?: string
): Promise<ReferenceImportResultDto> {
  return apiFetch<ReferenceImportResultDto>('/api/admin/references/import/commit', {
    method: 'POST',
    body: request,
    token,
  });
}
