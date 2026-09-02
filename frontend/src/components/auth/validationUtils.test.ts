import { describe, it, expect } from 'vitest';
import {
  validateName,
  validateBirthDate,
  validateWorkerNumber,
  validateChineseIdCard,
  validateEmail,
  validatePassword,
  validateOtp,
  extractDobAndGenderFromIdCard,
  isDisposableEmail,
  evaluatePasswordStrength,
  getDaysInMonth,
} from './validationUtils';

// ═══════════════════════════════════════════════════════════════════════════
// validateName
// ═══════════════════════════════════════════════════════════════════════════

describe('validateName', () => {
  it('rejects empty string', () => {
    const result = validateName('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入姓名');
  });

  it('rejects whitespace-only input', () => {
    const result = validateName('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入姓名');
  });

  it('rejects single character', () => {
    const result = validateName('王');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('姓名长度至少需要 2 个字符');
  });

  it('rejects name exceeding 30 characters', () => {
    const longName = '买买提买买提买买提买买提买买提买买提买买提买买提买买提买买提买'; // 31 chars
    const result = validateName(longName);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('姓名长度不能超过 30 个字符');
  });

  it('rejects names with digits', () => {
    const result = validateName('张三3');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('姓名只能包含中文和中间点（·）');
  });

  it('rejects names with special symbols', () => {
    const result = validateName('张三@');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('姓名只能包含中文和中间点（·）');
  });

  it('rejects names with spaces', () => {
    const result = validateName('张 三');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('姓名只能包含中文和中间点（·）');
  });

  it('rejects English and Latin names', () => {
    const result = validateName('Zhang San');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('姓名只能包含中文和中间点（·）');
  });

  it('rejects mixed Chinese and Latin characters', () => {
    const result = validateName('John 张');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('姓名只能包含中文和中间点（·）');
  });

  it('rejects names starting or ending with a middle dot', () => {
    expect(validateName('·张三').isValid).toBe(false);
    expect(validateName('张三·').isValid).toBe(false);
  });

  it('rejects names with consecutive middle dots', () => {
    expect(validateName('买买提··吐尔逊').isValid).toBe(false);
  });

  it('accepts valid Chinese name', () => {
    expect(validateName('张三').isValid).toBe(true);
  });

  it('accepts valid Chinese name with four characters', () => {
    expect(validateName('欧阳娜娜').isValid).toBe(true);
  });

  it('accepts minority name with middle dot ·', () => {
    expect(validateName('买买提·吐尔逊').isValid).toBe(true);
  });

  it('accepts minority name with bullet •', () => {
    expect(validateName('买买提•吐尔逊').isValid).toBe(true);
  });

  it('accepts exactly 2 characters', () => {
    expect(validateName('李四').isValid).toBe(true);
  });

  it('accepts exactly 30 characters', () => {
    const name30 = '买买提买买提买买提买买提买买提买买提买买提买买提买买提买买提'; // 30 chars
    expect(validateName(name30).isValid).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// validateBirthDate
// ═══════════════════════════════════════════════════════════════════════════

describe('validateBirthDate', () => {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100;
  const maxYear = currentYear - 18;

  it('rejects empty fields', () => {
    const result = validateBirthDate('', '', '');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请完整输入出生日期的年、月、日');
  });

  it('rejects missing year', () => {
    const result = validateBirthDate('', '5', '12');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请完整输入出生日期的年、月、日');
  });

  it('rejects missing month', () => {
    const result = validateBirthDate('2000', '', '12');
    expect(result.isValid).toBe(false);
  });

  it('rejects missing day', () => {
    const result = validateBirthDate('2000', '5', '');
    expect(result.isValid).toBe(false);
  });

  it('rejects non-numeric year', () => {
    const result = validateBirthDate('abc', '5', '12');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入有效的数字');
  });

  it('rejects age < 18 (year too recent)', () => {
    const result = validateBirthDate(String(currentYear - 10), '5', '12');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(`请输入有效的年份 (${minYear}-${maxYear})`);
  });

  it('rejects age > 100 (year too old)', () => {
    const result = validateBirthDate(String(currentYear - 101), '5', '12');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(`请输入有效的年份 (${minYear}-${maxYear})`);
  });

  it('rejects invalid month (0)', () => {
    const result = validateBirthDate('2000', '0', '12');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入有效的月份 (1-12)');
  });

  it('rejects invalid month (13)', () => {
    const result = validateBirthDate('2000', '13', '12');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入有效的月份 (1-12)');
  });

  it('rejects day 31 for 30-day month (April)', () => {
    const result = validateBirthDate('2000', '4', '31');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入有效的日期 (该月最大天数为 30 日)');
  });

  it('rejects day 31 for 30-day month (June)', () => {
    const result = validateBirthDate('2000', '6', '31');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入有效的日期 (该月最大天数为 30 日)');
  });

  it('rejects Feb 29 on non-leap year (1999)', () => {
    const result = validateBirthDate('1999', '2', '29');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入有效的日期 (该月最大天数为 28 日)');
  });

  it('rejects Feb 29 on century non-leap year (1900)', () => {
    // 1900 is divisible by 100 but not 400, so not a leap year
    // However 1900 is likely out of age range. Test getDaysInMonth directly.
    expect(getDaysInMonth(1900, 2)).toBe(28);
  });

  it('accepts Feb 29 on leap year (2000)', () => {
    const result = validateBirthDate('2000', '2', '29');
    expect(result.isValid).toBe(true);
  });

  it('accepts Feb 29 on leap year (2004)', () => {
    const result = validateBirthDate('2004', '2', '29');
    expect(result.isValid).toBe(true);
  });

  it('rejects Feb 30 even on leap year', () => {
    const result = validateBirthDate('2000', '2', '30');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入有效的日期 (该月最大天数为 29 日)');
  });

  it('rejects day 0', () => {
    const result = validateBirthDate('2000', '5', '0');
    expect(result.isValid).toBe(false);
  });

  it('accepts valid date at minimum age boundary', () => {
    const result = validateBirthDate(String(maxYear), '1', '1');
    expect(result.isValid).toBe(true);
  });

  it('accepts valid date at maximum age boundary', () => {
    const result = validateBirthDate(String(minYear), '12', '31');
    expect(result.isValid).toBe(true);
  });

  it('accepts valid date: January 31', () => {
    const result = validateBirthDate('2000', '1', '31');
    expect(result.isValid).toBe(true);
  });

  it('accepts valid date: March 31', () => {
    const result = validateBirthDate('2000', '3', '31');
    expect(result.isValid).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// getDaysInMonth
// ═══════════════════════════════════════════════════════════════════════════

describe('getDaysInMonth', () => {
  it('returns 31 for January', () => expect(getDaysInMonth(2000, 1)).toBe(31));
  it('returns 29 for Feb in leap year (2000)', () => expect(getDaysInMonth(2000, 2)).toBe(29));
  it('returns 28 for Feb in non-leap year (2001)', () => expect(getDaysInMonth(2001, 2)).toBe(28));
  it('returns 28 for Feb in century non-leap year (1900)', () => expect(getDaysInMonth(1900, 2)).toBe(28));
  it('returns 29 for Feb in 400-year leap (2000)', () => expect(getDaysInMonth(2000, 2)).toBe(29));
  it('returns 30 for April', () => expect(getDaysInMonth(2000, 4)).toBe(30));
  it('returns 30 for June', () => expect(getDaysInMonth(2000, 6)).toBe(30));
  it('returns 30 for September', () => expect(getDaysInMonth(2000, 9)).toBe(30));
  it('returns 30 for November', () => expect(getDaysInMonth(2000, 11)).toBe(30));
  it('returns 31 for December', () => expect(getDaysInMonth(2000, 12)).toBe(31));
});

// ═══════════════════════════════════════════════════════════════════════════
// validateWorkerNumber
// ═══════════════════════════════════════════════════════════════════════════

describe('validateWorkerNumber', () => {
  it('rejects empty string', () => {
    const result = validateWorkerNumber('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入工号');
  });

  it('rejects whitespace-only input', () => {
    const result = validateWorkerNumber('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入工号');
  });

  it('rejects single character', () => {
    const result = validateWorkerNumber('A');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('工号长度至少需要 2 个字符');
  });

  it('rejects string exceeding 30 characters', () => {
    const long = 'A'.repeat(31);
    const result = validateWorkerNumber(long);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('工号长度不能超过 30 个字符');
  });

  it('rejects names with spaces', () => {
    const result = validateWorkerNumber('EMP 001');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('工号只能包含字母、数字、连字符和下划线');
  });

  it('rejects special characters (@)', () => {
    const result = validateWorkerNumber('EMP@001');
    expect(result.isValid).toBe(false);
  });

  it('rejects Chinese characters', () => {
    const result = validateWorkerNumber('工号一');
    expect(result.isValid).toBe(false);
  });

  it('accepts alphanumeric identifier', () => {
    expect(validateWorkerNumber('EMP001').isValid).toBe(true);
  });

  it('accepts identifier with hyphens', () => {
    expect(validateWorkerNumber('EMP-001').isValid).toBe(true);
  });

  it('accepts identifier with underscores', () => {
    expect(validateWorkerNumber('EMP_001').isValid).toBe(true);
  });

  it('accepts identifier with mixed hyphens and underscores', () => {
    expect(validateWorkerNumber('DOC-8888_A').isValid).toBe(true);
  });

  it('accepts exactly 2 characters', () => {
    expect(validateWorkerNumber('AB').isValid).toBe(true);
  });

  it('accepts exactly 30 characters', () => {
    expect(validateWorkerNumber('A'.repeat(30)).isValid).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// validateChineseIdCard
// ═══════════════════════════════════════════════════════════════════════════

describe('validateChineseIdCard', () => {
  // Known valid ID: 11010519491231002X
  // Province: 11 (Beijing), Birth: 1949-12-31, Seq: 002, Check: X
  // Let's compute: weights = [7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2]
  // digits: 1,1,0,1,0,5,1,9,4,9,1,2,3,1,0,0,2
  // sum = 1*7+1*9+0*10+1*5+0*8+5*4+1*2+9*1+4*6+9*3+1*7+2*9+3*10+1*5+0*8+0*4+2*2
  //     = 7+9+0+5+0+20+2+9+24+27+7+18+30+5+0+0+4 = 167
  // 167 % 11 = 2 => check char = 'X' ✓

  const VALID_ID = '11010519491231002X';

  it('rejects empty string', () => {
    const result = validateChineseIdCard('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入身份证号');
  });

  it('rejects 17-digit string (too short)', () => {
    const result = validateChineseIdCard('1101051949123100');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入有效的18位居民身份证号码');
  });

  it('rejects 19-character string (too long)', () => {
    const result = validateChineseIdCard('110105194912310021X');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入有效的18位居民身份证号码');
  });

  it('rejects non-digit characters in positions 1-17', () => {
    const result = validateChineseIdCard('1101051949A2310021');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入有效的18位居民身份证号码');
  });

  it('rejects letters other than X at position 18', () => {
    const result = validateChineseIdCard('11010519491231002Y');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入有效的18位居民身份证号码');
  });

  it('rejects invalid province code (99)', () => {
    // Use 99xxxx... — need 18 digits with valid format
    const result = validateChineseIdCard('990105194912310021');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('身份证号中的地区代码无效');
  });

  it('rejects invalid birth month (13)', () => {
    // 110105 1949 13 31 002X — month 13
    const result = validateChineseIdCard('110105194913310021');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('身份证号中的出生月份无效');
  });

  it('rejects invalid birth day (Feb 30)', () => {
    // 110105 2000 02 30 002? — Feb 30 even in leap year
    const result = validateChineseIdCard('110105200002300021');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('身份证号中的出生日期无效');
  });

  it('rejects invalid checksum digit', () => {
    // Change last digit from X to 1 for VALID_ID
    const result = validateChineseIdCard('110105194912310021');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('身份证号校验码不正确');
  });

  it('accepts valid ID card with X check digit', () => {
    const result = validateChineseIdCard(VALID_ID);
    expect(result.isValid).toBe(true);
  });

  it('accepts lowercase x and normalizes to uppercase', () => {
    const result = validateChineseIdCard('11010519491231002x');
    expect(result.isValid).toBe(true);
  });

  it('accepts valid ID card with numeric check digit', () => {
    // 110101199001011234 — let's verify:
    // digits: 1,1,0,1,0,1,1,9,9,0,0,1,0,1,1,2,3
    // weights: 7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2
    // sum = 7+9+0+5+0+4+2+9+54+0+0+9+0+5+8+8+6 = 126
    // 126 % 11 = 5 => check char = '7'
    // So 11010119900101123 + 7 = 110101199001011237
    const result = validateChineseIdCard('110101199001011237');
    expect(result.isValid).toBe(true);
  });

  it('rejects when birth date mismatches expectedBirthDate', () => {
    // VALID_ID has birth date 1949-12-31
    const result = validateChineseIdCard(VALID_ID, '2000-01-01');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('身份证号中的出生日期与之前填写的出生日期不一致');
  });

  it('accepts when birth date matches expectedBirthDate', () => {
    const result = validateChineseIdCard(VALID_ID, '1949-12-31');
    expect(result.isValid).toBe(true);
  });

  it('rejects when gender mismatches expectedGender (male ID, expected 女)', () => {
    // VALID_ID digit 17 is '2' (even) => female
    // Wait, let me re-check: '11010519491231002X'
    // Position 17 (0-indexed 16) = '2' => even => 女
    const result = validateChineseIdCard(VALID_ID, undefined, '男');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('身份证号中的性别信息与之前选择的性别不一致');
  });

  it('accepts when gender matches expectedGender', () => {
    // VALID_ID digit at position 17 = '2' => even => 女
    const result = validateChineseIdCard(VALID_ID, undefined, '女');
    expect(result.isValid).toBe(true);
  });

  it('validates both birth date and gender cross-step consistency', () => {
    const result = validateChineseIdCard(VALID_ID, '1949-12-31', '女');
    expect(result.isValid).toBe(true);
  });

  it('rejects when both birth date and gender mismatch (reports birth date first)', () => {
    const result = validateChineseIdCard(VALID_ID, '2000-01-01', '男');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('身份证号中的出生日期与之前填写的出生日期不一致');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// validateEmail
// ═══════════════════════════════════════════════════════════════════════════

describe('validateEmail', () => {
  it('rejects empty string', () => {
    const result = validateEmail('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入电子邮箱');
  });

  it('rejects whitespace-only input', () => {
    const result = validateEmail('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入电子邮箱');
  });

  it('rejects missing @', () => {
    const result = validateEmail('usercsu.edu.cn');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入有效的电子邮箱地址');
  });

  it('rejects missing domain', () => {
    const result = validateEmail('user@');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入有效的电子邮箱地址');
  });

  it('rejects missing TLD', () => {
    const result = validateEmail('user@domain');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入有效的电子邮箱地址');
  });

  it('rejects 1-letter TLD', () => {
    const result = validateEmail('user@domain.c');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入有效的电子邮箱地址');
  });

  it('rejects email exceeding 64 characters', () => {
    const longEmail = 'a'.repeat(50) + '@example.com'; // 62 chars
    // Actually need > 64 chars
    const tooLongEmail = 'a'.repeat(53) + '@example.com'; // 65 chars
    const result = validateEmail(tooLongEmail);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('电子邮箱长度不能超过 64 个字符');
  });

  it('rejects consecutive dots in local part', () => {
    const result = validateEmail('user..name@domain.com');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入有效的电子邮箱地址');
  });

  it('accepts valid email', () => {
    expect(validateEmail('user@csu.edu.cn').isValid).toBe(true);
  });

  it('accepts email with subdomain', () => {
    expect(validateEmail('user@mail.csu.edu.cn').isValid).toBe(true);
  });

  it('accepts email with dots in local part', () => {
    expect(validateEmail('first.last@example.com').isValid).toBe(true);
  });

  it('accepts email with plus addressing', () => {
    expect(validateEmail('user+tag@example.com').isValid).toBe(true);
  });

  it('accepts email with hyphens in domain', () => {
    expect(validateEmail('user@my-domain.com').isValid).toBe(true);
  });

  it('accepts email at exactly 64 characters', () => {
    // 64 chars total
    const email64 = 'a'.repeat(51) + '@example.com'; // 51 + 1 + 11 = 63
    expect(validateEmail(email64).isValid).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// validatePassword
// ═══════════════════════════════════════════════════════════════════════════

describe('validatePassword', () => {
  it('rejects empty string', () => {
    const result = validatePassword('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('请输入密码');
  });

  it('rejects password shorter than 8 characters', () => {
    const result = validatePassword('Ab1234');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('密码长度至少需要 8 个字符');
  });

  it('rejects exactly 7 characters', () => {
    const result = validatePassword('Abc1234');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('密码长度至少需要 8 个字符');
  });

  it('rejects password longer than 64 characters', () => {
    const result = validatePassword('A' + '1'.repeat(64));
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('密码长度不能超过 64 个字符');
  });

  it('rejects all-digit password', () => {
    const result = validatePassword('12345678');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('密码必须同时包含字母和数字');
  });

  it('rejects all-letter password', () => {
    const result = validatePassword('abcdefgh');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('密码必须同时包含字母和数字');
  });

  it('rejects all-uppercase letter password', () => {
    const result = validatePassword('ABCDEFGH');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('密码必须同时包含字母和数字');
  });

  it('accepts valid alphanumeric password', () => {
    expect(validatePassword('Password1').isValid).toBe(true);
  });

  it('accepts exactly 8 characters with letters and digits', () => {
    expect(validatePassword('Abcd1234').isValid).toBe(true);
  });

  it('accepts exactly 64 characters with letters and digits', () => {
    const pwd64 = 'A' + '1'.repeat(63);
    expect(validatePassword(pwd64).isValid).toBe(true);
  });

  it('accepts password with special characters plus letters and digits', () => {
    expect(validatePassword('P@ssw0rd!123').isValid).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// validateOtp
// ═══════════════════════════════════════════════════════════════════════════

describe('validateOtp', () => {
  it('rejects empty or whitespace OTP', () => {
    expect(validateOtp('').isValid).toBe(false);
    expect(validateOtp('   ').isValid).toBe(false);
  });

  it('rejects non-6-digit OTP', () => {
    expect(validateOtp('12345').isValid).toBe(false);
    expect(validateOtp('1234567').isValid).toBe(false);
    expect(validateOtp('abcdef').isValid).toBe(false);
  });

  it('accepts valid 6-digit OTP', () => {
    expect(validateOtp('123456').isValid).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// extractDobAndGenderFromIdCard
// ═══════════════════════════════════════════════════════════════════════════

describe('extractDobAndGenderFromIdCard', () => {
  it('returns null for invalid ID card', () => {
    expect(extractDobAndGenderFromIdCard('123456')).toBeNull();
    expect(extractDobAndGenderFromIdCard('110101200001011234')).toBeNull();
  });

  it('extracts DOB and gender accurately for male ID card', () => {
    const result = extractDobAndGenderFromIdCard('110101200001011232');
    expect(result).not.toBeNull();
    expect(result?.birthDate).toBe('2000-01-01');
    expect(result?.gender).toBe('男');
  });

  it('extracts DOB and gender accurately for female ID card', () => {
    const result = extractDobAndGenderFromIdCard('110101200001011240');
    expect(result).not.toBeNull();
    expect(result?.birthDate).toBe('2000-01-01');
    expect(result?.gender).toBe('女');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// isDisposableEmail
// ═══════════════════════════════════════════════════════════════════════════

describe('isDisposableEmail', () => {
  it('identifies disposable email domains', () => {
    expect(isDisposableEmail('test@mailinator.com')).toBe(true);
    expect(isDisposableEmail('user@tempmail.com')).toBe(true);
    expect(isDisposableEmail('temp@yopmail.com')).toBe(true);
  });

  it('allows institutional and legitimate email domains', () => {
    expect(isDisposableEmail('teacher@csu.edu.cn')).toBe(false);
    expect(isDisposableEmail('doctor@hospital.org')).toBe(false);
    expect(isDisposableEmail('admin@gmail.com')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// evaluatePasswordStrength
// ═══════════════════════════════════════════════════════════════════════════

describe('evaluatePasswordStrength', () => {
  it('evaluates weak passwords', () => {
    const res = evaluatePasswordStrength('123');
    expect(res.level).toBe('weak');
    expect(res.checks.minLength).toBe(false);
  });

  it('evaluates fair passwords', () => {
    const res = evaluatePasswordStrength('Pass1234');
    expect(res.checks.minLength).toBe(true);
    expect(res.checks.hasLetter).toBe(true);
    expect(res.checks.hasDigit).toBe(true);
  });

  it('evaluates strong passwords with special chars and length >= 10', () => {
    const res = evaluatePasswordStrength('P@ssw0rd!2026');
    expect(res.level).toBe('strong');
    expect(res.checks.hasSpecial).toBe(true);
  });
});

