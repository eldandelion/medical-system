export type StudentImportStatus = 'READY' | 'DUPLICATE' | 'INVALID';

export type StudentImportErrorCode =
  | 'REQUIRED_FIELD_MISSING'
  | 'MAJOR_NOT_FOUND'
  | 'TEACHER_NOT_FOUND'
  | 'ETHNICITY_NOT_FOUND'
  | 'DUPLICATE_IN_DATABASE'
  | 'INTRA_FILE_DUPLICATE'
  | 'INVALID_ID_CARD_FORMAT'
  | 'INVALID_PHONE_FORMAT'
  | 'INVALID_EMAIL_FORMAT'
  | 'INVALID_DATE_FORMAT'
  | 'FUTURE_DATE'
  | 'INVALID_NAME_FORMAT';

export interface StudentImportFieldError {
  field: string;
  code: StudentImportErrorCode;
  invalidValue?: string | null;
}

export interface StudentImportRow {
  rowNumber: number;
  studentNumber: string;
  name: string;
  major: string;
  enrollmentDate: string | null;
  idCardNumber?: string | null;
  gender?: string | null;
  ethnicity?: string | null;
  contactNumber?: string | null;
  email?: string | null;
  homeAddress?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  teacherEmployeeNumber?: string | null;
  status: StudentImportStatus;
  errors: StudentImportFieldError[];
}

export interface StudentImportPreview {
  totalRows: number;
  readyCount: number;
  duplicateCount: number;
  invalidCount: number;
  rows: StudentImportRow[];
}

export interface StudentImportCommitRequest {
  rows: StudentImportRow[];
  overwriteDuplicates: boolean;
}

export interface StudentImportResult {
  totalProcessed: number;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  failedRows: StudentImportRow[];
}
