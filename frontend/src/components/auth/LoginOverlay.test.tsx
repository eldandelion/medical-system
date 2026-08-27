import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { LoginOverlay } from './LoginOverlay';
import { AccountMenu } from '../layout/AccountMenu';

let originalFetch: typeof global.fetch;

beforeEach(() => {
  originalFetch = global.fetch;
  global.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
    if (url.includes('/api/auth/verify-identifier')) {
      const body = JSON.parse((init?.body as string) || '{}');
      const raw = (body.identifier || '').trim().toLowerCase();
      if (!raw) {
        return {
          ok: true,
          json: async () => ({ exists: false, isAccountActive: false }),
        };
      }
      if (raw === 'disabled_user@univ.edu.cn') {
        return {
          ok: true,
          json: async () => ({ exists: true, isAccountActive: false, maskedIdentifier: raw }),
        };
      }
      if (
        raw === 'testuser@example.com' ||
        raw === '2021001' ||
        raw === 'emp-00001' ||
        raw === 'doc-00001' ||
        raw === 'alice@university.edu' ||
        raw === 'user@example.com' ||
        raw === 'liming@univ.edu.cn' ||
        raw === 's2023001' ||
        raw === 'warfacealpine10@gmail.com'
      ) {
        return {
          ok: true,
          json: async () => ({ exists: true, isAccountActive: true, maskedIdentifier: raw }),
        };
      }
      return {
        ok: true,
        json: async () => ({ exists: false, isAccountActive: false }),
      };
    }
    return {
      ok: true,
      json: async () => ({}),
    };
  });
});

afterEach(() => {
  global.fetch = originalFetch;
  cleanup();
});

function setMdInputValue(field: HTMLElement, value: string) {
  (field as any).value = value;
  fireEvent(field, new Event('input', { bubbles: true, cancelable: true }));
}

describe('LoginOverlay Component', () => {
  it('renders nothing when isOpen is false', () => {
    render(<LoginOverlay isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText('登录')).toBeNull();
  });

  it('renders Step 1 with CSU branding, M3 UI in Chinese, and without outline / top-right close button', () => {
    render(<LoginOverlay isOpen={true} onClose={() => {}} />);

    // Left Column
    expect(screen.getByText('CSU')).toBeDefined();
    expect(screen.getByText('登录')).toBeDefined();
    expect(screen.getByText('使用您的CSU账号')).toBeDefined();

    // Right Column
    const emailField = document.querySelector('md-outlined-text-field[label="电子邮件或学工号"]');
    expect(emailField).toBeDefined();
    expect(screen.getByText('忘记了电子邮件地址？')).toBeDefined();

    // Actions
    expect(screen.getByText('创建账号')).toBeDefined();
    expect(screen.getByText('下一步')).toBeDefined();

    // Upper right close icon button should be removed
    expect(screen.queryByLabelText('关闭')).toBeNull();

    // Omitted elements (Help, Privacy, Terms, Language Selector)
    expect(screen.queryByText('Help')).toBeNull();
    expect(screen.queryByText('Privacy')).toBeNull();
    expect(screen.queryByText('Terms')).toBeNull();
    expect(screen.queryByText('English (United States)')).toBeNull();
  });

  it('shows validation error on Step 1 if identifier is cleared and submitted', async () => {
    render(<LoginOverlay isOpen={true} onClose={() => {}} initialIdentifier="" />);

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(screen.getByText('请输入电子邮件地址或学工号')).toBeDefined();
    // Still in Step 1
    expect(screen.getByText('登录')).toBeDefined();
    expect(screen.queryByText('欢迎')).toBeNull();
  });

  it('transitions to Step 2 when Step 1 is submitted with valid email', async () => {
    render(<LoginOverlay isOpen={true} onClose={() => {}} initialIdentifier="" />);

    const emailField = document.querySelector('md-outlined-text-field[label="电子邮件或学工号"]') as HTMLElement;
    setMdInputValue(emailField, 'testuser@example.com');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    // Step 2 elements
    expect(await screen.findByText('欢迎')).toBeDefined();
    expect(screen.getByText('testuser@example.com')).toBeDefined();
    expect(screen.getByText('如要继续，请先验证您的身份')).toBeDefined();

    const passwordField = document.querySelector('md-outlined-text-field[label="输入您的密码"]');
    expect(passwordField).toBeDefined();
    expect(screen.getByText('显示密码')).toBeDefined();
    expect(screen.getByText('使用其他账号')).toBeDefined();
  });

  it('transitions to Step 2 when Step 1 is submitted with valid student number', async () => {
    render(<LoginOverlay isOpen={true} onClose={() => {}} initialIdentifier="" />);

    const emailField = document.querySelector('md-outlined-text-field[label="电子邮件或学工号"]') as HTMLElement;
    setMdInputValue(emailField, '2021001');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(await screen.findByText('欢迎')).toBeDefined();
    expect(screen.getByText('2021001')).toBeDefined();
  });

  it('transitions to Step 2 when Step 1 is submitted with valid teacher worker ID', async () => {
    render(<LoginOverlay isOpen={true} onClose={() => {}} initialIdentifier="" />);

    const emailField = document.querySelector('md-outlined-text-field[label="电子邮件或学工号"]') as HTMLElement;
    setMdInputValue(emailField, 'EMP-00001');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(await screen.findByText('欢迎')).toBeDefined();
    expect(screen.getByText('EMP-00001')).toBeDefined();
  });

  it('transitions to Step 2 when Step 1 is submitted with valid doctor worker ID', async () => {
    render(<LoginOverlay isOpen={true} onClose={() => {}} initialIdentifier="" />);

    const emailField = document.querySelector('md-outlined-text-field[label="电子邮件或学工号"]') as HTMLElement;
    setMdInputValue(emailField, 'DOC-00001');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(await screen.findByText('欢迎')).toBeDefined();
    expect(screen.getByText('DOC-00001')).toBeDefined();
  });

  it('displays error and stays on Step 1 when non-existent identifier is submitted', async () => {
    render(<LoginOverlay isOpen={true} onClose={() => {}} initialIdentifier="" />);

    const emailField = document.querySelector('md-outlined-text-field[label="电子邮件或学工号"]') as HTMLElement;
    setMdInputValue(emailField, 'nonexistent_account_9999');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(await screen.findByText('找不到您的账号，请检查输入或联系管理员')).toBeDefined();
    expect(screen.getByText('登录')).toBeDefined();
    expect(screen.queryByText('欢迎')).toBeNull();
  });

  it('displays error and stays on Step 1 when a deactivated or disabled account is submitted', async () => {
    render(<LoginOverlay isOpen={true} onClose={() => {}} initialIdentifier="" />);

    const emailField = document.querySelector('md-outlined-text-field[label="电子邮件或学工号"]') as HTMLElement;
    setMdInputValue(emailField, 'disabled_user@univ.edu.cn');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(await screen.findByText('该账号已被停用或注销，请联系管理员')).toBeDefined();
    expect(screen.getByText('登录')).toBeDefined();
    expect(screen.queryByText('欢迎')).toBeNull();
  });

  it('displays static account indicator chip in Step 2 and allows returning to Step 1 via 使用其他账号 button', async () => {
    render(<LoginOverlay isOpen={true} onClose={() => {}} initialIdentifier="alice@university.edu" />);

    // Advance to Step 2
    fireEvent.click(screen.getByText('下一步'));
    expect(await screen.findByText('欢迎')).toBeDefined();

    // The account email is displayed
    expect(screen.getByText('alice@university.edu')).toBeDefined();

    // No interactive switch button on chip or dropdown arrow
    expect(screen.queryByTitle('切换账号')).toBeNull();
    expect(screen.queryByText('arrow_drop_down')).toBeNull();

    // Click "使用其他账号" button to return to Step 1
    const tryAnotherAccountBtn = screen.getByText('使用其他账号');
    fireEvent.click(tryAnotherAccountBtn);

    expect(screen.getByText('登录')).toBeDefined();
    expect(screen.queryByText('欢迎')).toBeNull();
  });

  it('toggles password visibility with "显示密码" checkbox in Step 2', async () => {
    render(<LoginOverlay isOpen={true} onClose={() => {}} initialIdentifier="user@example.com" />);

    // Advance to Step 2
    fireEvent.click(screen.getByText('下一步'));
    expect(await screen.findByText('欢迎')).toBeDefined();

    const checkboxLabel = screen.getByText('显示密码');
    const passwordField = document.querySelector('md-outlined-text-field[label="输入您的密码"]') as HTMLElement;

    expect(passwordField.getAttribute('type')).toBe('password');

    fireEvent.click(checkboxLabel);
    expect(passwordField.getAttribute('type')).toBe('text');

    fireEvent.click(checkboxLabel);
    expect(passwordField.getAttribute('type')).toBe('password');
  });

  it('shows error if password is empty and calls onSuccess/onClose on valid password submit', async () => {
    const onCloseMock = vi.fn();
    const onSuccessMock = vi.fn();

    render(
      <LoginOverlay
        isOpen={true}
        onClose={onCloseMock}
        onSuccess={onSuccessMock}
        initialIdentifier="user@example.com"
      />
    );

    // Advance to Step 2
    fireEvent.click(screen.getByText('下一步'));
    expect(await screen.findByText('欢迎')).toBeDefined();

    // Submit empty password
    fireEvent.click(screen.getByText('下一步'));
    expect(screen.getByText('请输入密码')).toBeDefined();
    expect(onSuccessMock).not.toHaveBeenCalled();

    // Type password
    const passwordField = document.querySelector('md-outlined-text-field[label="输入您的密码"]') as HTMLElement;
    setMdInputValue(passwordField, 'MySecurePassword123!');

    // Submit valid password
    fireEvent.click(screen.getByText('下一步'));
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onCloseMock = vi.fn();
    render(<LoginOverlay isOpen={true} onClose={onCloseMock} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('triggers onAddAccountClick from AccountMenu when clicking 添加其他账号', () => {
    const onAddAccountClickMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <AccountMenu
        isOpen={true}
        onClose={onCloseMock}
        onAddAccountClick={onAddAccountClickMock}
      />
    );

    const addAccountItem = screen.getByText('添加其他账号');
    fireEvent.click(addAccountItem);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
    expect(onAddAccountClickMock).toHaveBeenCalledTimes(1);
  });

  it('navigates from Login Step 1 to Register Role Selection screen when clicking 创建账号', () => {
    render(<LoginOverlay isOpen={true} onClose={() => {}} />);

    // Initially in Login Step 1
    expect(screen.getByText('登录')).toBeDefined();
    expect(screen.getByText('使用您的CSU账号')).toBeDefined();

    // Click 创建账号
    const createAccountButton = screen.getByText('创建账号');
    fireEvent.click(createAccountButton);

    // Navigated to Register Role Selection screen
    expect(screen.getByText('创建账号')).toBeDefined();
    expect(screen.getByText('选择您的身份类型以继续注册')).toBeDefined();
    expect(screen.getByText('学生')).toBeDefined();
    expect(screen.getByText('教师')).toBeDefined();
    expect(screen.getByText('主任咨询师')).toBeDefined();
    expect(screen.getByText('医院分诊管理员')).toBeDefined();
    expect(screen.getByText('精神科医生')).toBeDefined();
    expect(screen.queryByText('系统管理员')).toBeNull();
  });

  it('allows selecting a user role and proceeding on registration screen', () => {
    const onRoleSelectMock = vi.fn();
    render(
      <LoginOverlay
        isOpen={true}
        onClose={() => {}}
        initialView="register-role-select"
        onRoleSelect={onRoleSelectMock}
      />
    );

    // Select '教师'
    const teacherCard = screen.getByText('教师').closest('[role="option"]') as HTMLElement;
    fireEvent.click(teacherCard);

    // Click 下一步
    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(onRoleSelectMock).toHaveBeenCalledWith('teacher');
  });

  it('navigates back to Login Step 1 when clicking 返回登录 on registration screen', () => {
    render(<LoginOverlay isOpen={true} onClose={() => {}} />);

    // Go to registration
    fireEvent.click(screen.getByText('创建账号'));
    expect(screen.getByText('选择您的身份类型以继续注册')).toBeDefined();

    // Click 返回登录
    fireEvent.click(screen.getByText('返回登录'));

    // Back to Login Step 1
    expect(screen.getByText('登录')).toBeDefined();
    expect(screen.getByText('使用您的CSU账号')).toBeDefined();
    expect(screen.queryByText('选择您的身份类型以继续注册')).toBeNull();
  });

  it('navigates from Role Selection to Name & Gender step and submits basic info', () => {
    const onBasicInfoSubmitMock = vi.fn();
    render(
      <LoginOverlay
        isOpen={true}
        onClose={() => {}}
        initialView="register-role-select"
        onBasicInfoSubmit={onBasicInfoSubmitMock}
      />
    );

    // 1. Select '学生'
    const studentItem = screen.getByText('学生').closest('[role="option"]') as HTMLElement;
    fireEvent.click(studentItem);

    // 2. Click 下一步 -> Navigates to Basic Info step
    fireEvent.click(screen.getByText('下一步'));

    expect(screen.getByText('基本信息')).toBeDefined();
    expect(screen.getByText('输入您的姓名和性别')).toBeDefined();

    // 3. Fill in name and gender
    const nameField = document.querySelector('md-outlined-text-field[label="姓名"]') as HTMLElement;
    setMdInputValue(nameField, '林同学');

    const genderSelect = document.querySelector('md-outlined-select[label="性别"]') as HTMLElement;
    (genderSelect as any).value = '女';
    fireEvent(genderSelect, new Event('change', { bubbles: true, cancelable: true }));

    // 4. Click 下一步
    fireEvent.click(screen.getByText('下一步'));

    expect(onBasicInfoSubmitMock).toHaveBeenCalledWith({
      role: 'student',
      name: '林同学',
      gender: '女',
    });
  });

  it('navigates back from Name & Gender step to Role Selection when clicking 返回', () => {
    render(
      <LoginOverlay
        isOpen={true}
        onClose={() => {}}
        initialView="register-basic-info"
      />
    );

    expect(screen.getByText('基本信息')).toBeDefined();
    expect(screen.getByText('输入您的姓名和性别')).toBeDefined();

    // Click 返回
    fireEvent.click(screen.getByText('返回'));

    // Navigated back to Role Selection
    expect(screen.getByText('选择您的身份类型以继续注册')).toBeDefined();
    expect(screen.getByText('学生')).toBeDefined();
  });

  it('navigates through full 3-step registration flow: Role -> Name & Gender -> Date of Birth & Ethnicity', () => {
    const onDemographicsSubmitMock = vi.fn();
    render(
      <LoginOverlay
        isOpen={true}
        onClose={() => {}}
        initialView="register-role-select"
        onDemographicsSubmit={onDemographicsSubmitMock}
      />
    );

    // Step 1: Role Selection
    const doctorItem = screen.getByText('精神科医生').closest('[role="option"]') as HTMLElement;
    fireEvent.click(doctorItem);
    fireEvent.click(screen.getByText('下一步'));

    // Step 2: Name & Gender
    expect(screen.getByText('基本信息')).toBeDefined();
    expect(screen.getByText('输入您的姓名和性别')).toBeDefined();

    const nameField = document.querySelector('md-outlined-text-field[label="姓名"]') as HTMLElement;
    setMdInputValue(nameField, '张医生');

    const genderSelect = document.querySelector('md-outlined-select[label="性别"]') as HTMLElement;
    (genderSelect as any).value = '男';
    fireEvent(genderSelect, new Event('change', { bubbles: true, cancelable: true }));

    fireEvent.click(screen.getByText('下一步'));

    // Step 3: Date of Birth & Ethnicity
    expect(screen.getByText('输入您的出生日期和民族')).toBeDefined();

    const monthSelect = document.querySelector('md-outlined-select[label="月"]') as HTMLElement;
    (monthSelect as any).value = '10';
    fireEvent(monthSelect, new Event('change', { bubbles: true, cancelable: true }));

    const dayField = document.querySelector('md-outlined-text-field[label="日"]') as HTMLElement;
    setMdInputValue(dayField, '25');

    const yearField = document.querySelector('md-outlined-text-field[label="年"]') as HTMLElement;
    setMdInputValue(yearField, '1990');

    const ethnicitySelect = document.querySelector('md-outlined-select[label="民族"]') as HTMLElement;
    (ethnicitySelect as any).value = '汉族';
    fireEvent(ethnicitySelect, new Event('change', { bubbles: true, cancelable: true }));

    fireEvent.click(screen.getByText('下一步'));

    expect(onDemographicsSubmitMock).toHaveBeenCalledWith({
      role: 'doctor',
      name: '张医生',
      gender: '男',
      year: '1990',
      month: '10',
      day: '25',
      dateOfBirth: '1990-10-25',
      ethnicity: '汉族',
    });
  });

  it('navigates through full 4-step registration flow: Role -> Name & Gender -> Date of Birth & Ethnicity -> School & Department & Worker Number', () => {
    const onAffiliationSubmitMock = vi.fn();
    render(
      <LoginOverlay
        isOpen={true}
        onClose={() => {}}
        initialView="register-role-select"
        onAffiliationSubmit={onAffiliationSubmitMock}
      />
    );

    // Step 1: Role Selection
    const teacherItem = screen.getByText('教师').closest('[role="option"]') as HTMLElement;
    fireEvent.click(teacherItem);
    fireEvent.click(screen.getByText('下一步'));

    // Step 2: Name & Gender
    expect(screen.getByText('输入您的姓名和性别')).toBeDefined();
    const nameField = document.querySelector('md-outlined-text-field[label="姓名"]') as HTMLElement;
    setMdInputValue(nameField, '李老师');

    const genderSelect = document.querySelector('md-outlined-select[label="性别"]') as HTMLElement;
    (genderSelect as any).value = '女';
    fireEvent(genderSelect, new Event('change', { bubbles: true, cancelable: true }));
    fireEvent.click(screen.getByText('下一步'));

    // Step 3: Date of Birth & Ethnicity
    expect(screen.getByText('输入您的出生日期和民族')).toBeDefined();
    const monthSelect = document.querySelector('md-outlined-select[label="月"]') as HTMLElement;
    (monthSelect as any).value = '6';
    fireEvent(monthSelect, new Event('change', { bubbles: true, cancelable: true }));

    const dayField = document.querySelector('md-outlined-text-field[label="日"]') as HTMLElement;
    setMdInputValue(dayField, '15');

    const yearField = document.querySelector('md-outlined-text-field[label="年"]') as HTMLElement;
    setMdInputValue(yearField, '1985');

    const ethnicitySelect = document.querySelector('md-outlined-select[label="民族"]') as HTMLElement;
    (ethnicitySelect as any).value = '汉族';
    fireEvent(ethnicitySelect, new Event('change', { bubbles: true, cancelable: true }));
    fireEvent.click(screen.getByText('下一步'));

    // Step 4: School, Department & Worker Number
    expect(screen.getByText('选择您的所属学校与部门，并输入工号')).toBeDefined();

    const schoolSelect = document.querySelector('md-outlined-select[label="学校"]') as HTMLElement;
    (schoolSelect as any).value = '中南大学';
    fireEvent(schoolSelect, new Event('change', { bubbles: true, cancelable: true }));

    const deptSelect = document.querySelector('md-outlined-select[label="部门"]') as HTMLElement;
    (deptSelect as any).value = '心理健康教育与咨询中心';
    fireEvent(deptSelect, new Event('change', { bubbles: true, cancelable: true }));

    const workerField = document.querySelector('md-outlined-text-field[label="工号"]') as HTMLElement;
    setMdInputValue(workerField, 'EMP-00001');

    fireEvent.click(screen.getByText('下一步'));

    expect(onAffiliationSubmitMock).toHaveBeenCalledWith({
      role: 'teacher',
      name: '李老师',
      gender: '女',
      year: '1985',
      month: '6',
      day: '15',
      dateOfBirth: '1985-06-15',
      ethnicity: '汉族',
      school: '中南大学',
      department: '心理健康教育与咨询中心',
      workerNumber: 'EMP-00001',
    });
  });

  it('navigates through complete 6-step registration: Role -> Name & Gender -> DOB -> Affiliation -> ID & Email -> Password', () => {
    const onRegisterCompleteMock = vi.fn();
    render(
      <LoginOverlay
        isOpen={true}
        onClose={() => {}}
        initialView="register-role-select"
        onRegisterComplete={onRegisterCompleteMock}
      />
    );

    // Step 1: Role Selection
    const doctorItem = screen.getByText('精神科医生').closest('[role="option"]') as HTMLElement;
    fireEvent.click(doctorItem);
    fireEvent.click(screen.getByText('下一步'));

    // Step 2: Name & Gender
    expect(screen.getByText('输入您的姓名和性别')).toBeDefined();
    const nameField = document.querySelector('md-outlined-text-field[label="姓名"]') as HTMLElement;
    setMdInputValue(nameField, '张医生');
    const genderSelect = document.querySelector('md-outlined-select[label="性别"]') as HTMLElement;
    (genderSelect as any).value = '男';
    fireEvent(genderSelect, new Event('change', { bubbles: true, cancelable: true }));
    fireEvent.click(screen.getByText('下一步'));

    // Step 3: Date of Birth & Ethnicity
    expect(screen.getByText('输入您的出生日期和民族')).toBeDefined();
    const monthSelect = document.querySelector('md-outlined-select[label="月"]') as HTMLElement;
    (monthSelect as any).value = '10';
    fireEvent(monthSelect, new Event('change', { bubbles: true, cancelable: true }));
    const dayField = document.querySelector('md-outlined-text-field[label="日"]') as HTMLElement;
    setMdInputValue(dayField, '25');
    const yearField = document.querySelector('md-outlined-text-field[label="年"]') as HTMLElement;
    setMdInputValue(yearField, '1990');
    const ethnicitySelect = document.querySelector('md-outlined-select[label="民族"]') as HTMLElement;
    (ethnicitySelect as any).value = '汉族';
    fireEvent(ethnicitySelect, new Event('change', { bubbles: true, cancelable: true }));
    fireEvent.click(screen.getByText('下一步'));

    // Step 4: School & Department & Worker Number
    expect(screen.getByText('选择您的所属学校与部门，并输入工号')).toBeDefined();
    const schoolSelect = document.querySelector('md-outlined-select[label="学校"]') as HTMLElement;
    (schoolSelect as any).value = '中南大学';
    fireEvent(schoolSelect, new Event('change', { bubbles: true, cancelable: true }));
    const deptSelect = document.querySelector('md-outlined-select[label="部门"]') as HTMLElement;
    (deptSelect as any).value = '湘雅医学院';
    fireEvent(deptSelect, new Event('change', { bubbles: true, cancelable: true }));
    const workerField = document.querySelector('md-outlined-text-field[label="工号"]') as HTMLElement;
    setMdInputValue(workerField, 'DOC-00001');
    fireEvent.click(screen.getByText('下一步'));

    // Step 5: ID Card Number & Email
    expect(screen.getByText('输入您的身份证号和电子邮箱')).toBeDefined();
    const idCardField = document.querySelector('md-outlined-text-field[label="身份证号"]') as HTMLElement;
    setMdInputValue(idCardField, '110101199010251234');
    const emailField = document.querySelector('md-outlined-text-field[label="电子邮箱"]') as HTMLElement;
    setMdInputValue(emailField, 'zhangdoctor@csu.edu.cn');
    fireEvent.click(screen.getByText('下一步'));

    // Step 6: Password & Confirm Password
    expect(screen.getByText('为您的账号设置一个强密码')).toBeDefined();
    const pwdField = document.querySelector('md-outlined-text-field[label="密码"]') as HTMLElement;
    setMdInputValue(pwdField, 'DoctorPassword123');
    const confirmPwdField = document.querySelector('md-outlined-text-field[label="确认密码"]') as HTMLElement;
    setMdInputValue(confirmPwdField, 'DoctorPassword123');
    fireEvent.click(screen.getByText('创建账号'));

    expect(onRegisterCompleteMock).toHaveBeenCalledWith({
      role: 'doctor',
      name: '张医生',
      gender: '男',
      year: '1990',
      month: '10',
      day: '25',
      dateOfBirth: '1990-10-25',
      ethnicity: '汉族',
      school: '中南大学',
      department: '湘雅医学院',
      workerNumber: 'DOC-00001',
      idCardNumber: '110101199010251234',
      email: 'zhangdoctor@csu.edu.cn',
      password: 'DoctorPassword123',
    });
  });
});
