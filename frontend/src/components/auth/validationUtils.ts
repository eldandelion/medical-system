/**
 * Pure domain validation utilities for registration fields.
 *
 * Zero React or DOM dependencies — all functions are pure, stateless,
 * and return a typed {@link ValidationResult}.
 *
 * Standards implemented:
 * - GB 11643-1999 (Chinese Resident Identity Card)
 * - ISO 7064:1983 MOD 11-2 (check digit algorithm)
 * - RFC 5322 (email address format)
 */

// ─── Validation Result Type ────────────────────────────────────────────────

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

/** Minimum working age for registration (years). */
const MIN_AGE = 18;

/** Maximum working age for registration (years). */
const MAX_AGE = 100;

/** Valid province / administrative-area codes (GB/T 2260). */
const VALID_PROVINCE_CODES = new Set([
  '11', '12', '13', '14', '15',       // Beijing, Tianjin, Hebei, Shanxi, Inner Mongolia
  '21', '22', '23',                     // Liaoning, Jilin, Heilongjiang
  '31', '32', '33', '34', '35', '36', '37', // Shanghai, Jiangsu, Zhejiang, Anhui, Fujian, Jiangxi, Shandong
  '41', '42', '43', '44', '45', '46', // Henan, Hubei, Hunan, Guangdong, Guangxi, Hainan
  '50', '51', '52', '53', '54',       // Chongqing, Sichuan, Guizhou, Yunnan, Tibet
  '61', '62', '63', '64', '65',       // Shaanxi, Gansu, Qinghai, Ningxia, Xinjiang
  '71',                                 // Taiwan
  '81', '82',                           // Hong Kong, Macao
]);

/** ISO 7064:1983 MOD 11-2 weight factors for positions 1–17. */
const ID_CARD_WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];

/** Check digit mapping from MOD 11 remainder (0–10) to character. */
const ID_CARD_CHECK_CHARS = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

// ─── Name Validation ───────────────────────────────────────────────────────

/**
 * Validates a person's name.
 *
 * Accepted characters:
 * - Chinese characters (CJK Unified Ideographs U+4E00–U+9FFF)
 * - Latin letters (A-Z, a-z)
 * - Middle dots (· U+00B7, • U+2022) for ethnic minority names
 * - Single spaces between name parts
 *
 * Length: 2–30 characters (after trimming).
 * Leading/trailing/consecutive whitespace is rejected.
 */
export function validateName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { isValid: false, error: '请输入姓名' };
  }

  if (trimmed.length < 2) {
    return { isValid: false, error: '姓名长度至少需要 2 个字符' };
  }

  if (trimmed.length > 30) {
    return { isValid: false, error: '姓名长度不能超过 30 个字符' };
  }

  // Only allow: Chinese characters, Latin letters, middle dots (· •), single spaces
  const namePattern = /^[\u4e00-\u9fff\u00b7\u2022A-Za-z]+( [\u4e00-\u9fff\u00b7\u2022A-Za-z]+)*$/;
  if (!namePattern.test(trimmed)) {
    return { isValid: false, error: '姓名只能包含中文、英文字母、中间点（·）和空格' };
  }

  return { isValid: true };
}

// ─── Birth Date Validation ─────────────────────────────────────────────────

/**
 * Validates a birth date (year, month, day).
 *
 * Rules:
 * - All three fields must be non-empty and numeric.
 * - Year must represent a realistic working age: currentYear - 100 ≤ year ≤ currentYear - 18.
 * - Month must be 1–12.
 * - Day must be 1–daysInMonth(year, month), correctly handling leap years.
 */
export function validateBirthDate(
  yearStr: string,
  monthStr: string,
  dayStr: string,
): ValidationResult {
  if (!yearStr || !monthStr || !dayStr) {
    return { isValid: false, error: '请完整输入出生日期的年、月、日' };
  }

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return { isValid: false, error: '请输入有效的数字' };
  }

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - MAX_AGE;
  const maxYear = currentYear - MIN_AGE;

  if (year < minYear || year > maxYear) {
    return { isValid: false, error: `请输入有效的年份 (${minYear}-${maxYear})` };
  }

  if (month < 1 || month > 12) {
    return { isValid: false, error: '请输入有效的月份 (1-12)' };
  }

  const maxDays = getDaysInMonth(year, month);
  if (day < 1 || day > maxDays) {
    return { isValid: false, error: `请输入有效的日期 (该月最大天数为 ${maxDays} 日)` };
  }

  return { isValid: true };
}

/**
 * Returns the number of days in a given month of a given year.
 * Correctly handles leap years for February.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// ─── Worker Number Validation ──────────────────────────────────────────────

/**
 * Validates a worker/employee number.
 *
 * Allowed characters: alphanumeric (A-Z, a-z, 0-9), hyphens (-), underscores (_).
 * Length: 2–30 characters (after trimming).
 */
export function validateWorkerNumber(workerNo: string): ValidationResult {
  const trimmed = workerNo.trim();

  if (!trimmed) {
    return { isValid: false, error: '请输入工号' };
  }

  if (trimmed.length < 2) {
    return { isValid: false, error: '工号长度至少需要 2 个字符' };
  }

  if (trimmed.length > 30) {
    return { isValid: false, error: '工号长度不能超过 30 个字符' };
  }

  const workerNoPattern = /^[A-Za-z0-9\-_]+$/;
  if (!workerNoPattern.test(trimmed)) {
    return { isValid: false, error: '工号只能包含字母、数字、连字符和下划线' };
  }

  return { isValid: true };
}

// ─── Chinese ID Card Validation (GB 11643-1999) ───────────────────────────

/**
 * Validates a Chinese Resident Identity Card number (18 digits).
 *
 * Checks:
 * 1. Format: 17 digits + 1 check character (digit or X).
 * 2. Province code: first 2 digits must be a valid administrative area code.
 * 3. Birth date: digits 7–14 (YYYYMMDD) must form a valid calendar date.
 * 4. Check digit: ISO 7064:1983 MOD 11-2 weighted checksum.
 * 5. Cross-step consistency (optional): birth date and gender can be verified
 *    against values entered in earlier registration steps.
 *
 * @param idCard           The 18-character ID card string.
 * @param expectedBirthDate Optional YYYY-MM-DD birth date from the demographics step.
 * @param expectedGender    Optional gender string ('男' or '女') from the basic info step.
 */
export function validateChineseIdCard(
  idCard: string,
  expectedBirthDate?: string,
  expectedGender?: string,
): ValidationResult {
  const trimmed = idCard.trim().toUpperCase();

  if (!trimmed) {
    return { isValid: false, error: '请输入身份证号' };
  }

  // 1. Length & format check
  if (trimmed.length !== 18) {
    return { isValid: false, error: '请输入有效的18位居民身份证号码' };
  }

  const formatRegex = /^\d{17}[\dX]$/;
  if (!formatRegex.test(trimmed)) {
    return { isValid: false, error: '请输入有效的18位居民身份证号码' };
  }

  // 2. Province code check
  const provinceCode = trimmed.substring(0, 2);
  if (!VALID_PROVINCE_CODES.has(provinceCode)) {
    return { isValid: false, error: '身份证号中的地区代码无效' };
  }

  // 3. Birth date extraction & calendar validation
  const idYear = parseInt(trimmed.substring(6, 10), 10);
  const idMonth = parseInt(trimmed.substring(10, 12), 10);
  const idDay = parseInt(trimmed.substring(12, 14), 10);

  if (idMonth < 1 || idMonth > 12) {
    return { isValid: false, error: '身份证号中的出生月份无效' };
  }

  const maxDays = getDaysInMonth(idYear, idMonth);
  if (idDay < 1 || idDay > maxDays) {
    return { isValid: false, error: '身份证号中的出生日期无效' };
  }

  // 4. ISO 7064:1983 MOD 11-2 checksum
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(trimmed.charAt(i), 10) * ID_CARD_WEIGHTS[i];
  }
  const remainder = sum % 11;
  const expectedCheck = ID_CARD_CHECK_CHARS[remainder];

  if (trimmed.charAt(17) !== expectedCheck) {
    return { isValid: false, error: '身份证号校验码不正确' };
  }

  // 5. Cross-step consistency: birth date
  if (expectedBirthDate) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const idBirthDate = `${idYear}-${pad(idMonth)}-${pad(idDay)}`;
    if (idBirthDate !== expectedBirthDate) {
      return { isValid: false, error: '身份证号中的出生日期与之前填写的出生日期不一致' };
    }
  }

  // 6. Cross-step consistency: gender (digit 17 parity)
  if (expectedGender) {
    const genderDigit = parseInt(trimmed.charAt(16), 10);
    const idGender = genderDigit % 2 === 1 ? '男' : '女';
    if (idGender !== expectedGender) {
      return { isValid: false, error: '身份证号中的性别信息与之前选择的性别不一致' };
    }
  }

  return { isValid: true };
}

// ─── Email Validation ──────────────────────────────────────────────────────

/**
 * Validates an email address.
 *
 * Rules:
 * - Non-empty after trimming.
 * - Maximum 64 characters.
 * - Must match a practical RFC 5322 pattern with valid TLD (≥2 letters).
 * - No consecutive dots in local part.
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();

  if (!trimmed) {
    return { isValid: false, error: '请输入电子邮箱' };
  }

  if (trimmed.length > 64) {
    return { isValid: false, error: '电子邮箱长度不能超过 64 个字符' };
  }

  // Practical RFC 5322 compatible pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: '请输入有效的电子邮箱地址' };
  }

  // No consecutive dots in local part
  const localPart = trimmed.split('@')[0];
  if (localPart.includes('..')) {
    return { isValid: false, error: '请输入有效的电子邮箱地址' };
  }

  return { isValid: true };
}

// ─── Password Validation ───────────────────────────────────────────────────

/**
 * Validates a password for account creation.
 *
 * Rules:
 * - Length: 8–64 characters.
 * - Complexity: must contain at least one letter (A-Z/a-z) and one digit (0-9).
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: '请输入密码' };
  }

  if (password.length < 8) {
    return { isValid: false, error: '密码长度至少需要 8 个字符' };
  }

  if (password.length > 64) {
    return { isValid: false, error: '密码长度不能超过 64 个字符' };
  }

  const hasLetter = /[A-Za-z]/.test(password);
  const hasDigit = /\d/.test(password);

  if (!hasLetter || !hasDigit) {
    return { isValid: false, error: '密码必须同时包含字母和数字' };
  }

  return { isValid: true };
}
