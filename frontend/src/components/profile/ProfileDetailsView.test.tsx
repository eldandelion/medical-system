import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfileDetailsView } from './ProfileDetailsView';
import { SnackbarProvider } from '../../contexts/SnackbarContext';

afterEach(() => {
  cleanup();
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>{ui}</SnackbarProvider>
    </QueryClientProvider>
  );
};

describe('ProfileDetailsView Component', () => {
  it('does not render content when isOpen is false', () => {
    renderWithProviders(<ProfileDetailsView isOpen={false} onBack={() => {}} />);
    expect(screen.queryByText('个人信息')).toBeNull();
    expect(screen.queryByText('个人资料')).toBeNull();
  });

  it('renders personal info table and all demographic and academic details when isOpen is true', () => {
    renderWithProviders(<ProfileDetailsView isOpen={true} onBack={() => {}} />);

    expect(screen.getByText('个人信息')).toBeDefined();
    expect(screen.getByText('个人资料')).toBeDefined();
    expect(screen.getByText('部分信息可能会对使用 CSM 筛选门户的其他人员可见。')).toBeDefined();
    expect(screen.getByText('姓名')).toBeDefined();
    expect(screen.getByText('张伟')).toBeDefined();
    expect(screen.getByText('性别')).toBeDefined();
    expect(screen.getByText('男')).toBeDefined();
    expect(screen.getByText('民族')).toBeDefined();
    expect(screen.getByText('汉族')).toBeDefined();
    expect(screen.getByText('身份证号')).toBeDefined();
    expect(screen.getByText('110101200301011234')).toBeDefined();
    expect(screen.getByText('工号')).toBeDefined(); // default non-student fallback
    expect(screen.getByText('2021001')).toBeDefined();
    expect(screen.getByText('所属院校')).toBeDefined();
    expect(screen.getByText('中南大学')).toBeDefined();
    expect(screen.getByText('就读专业')).toBeDefined();
    expect(screen.getByText('计算机科学与技术')).toBeDefined();
    expect(screen.getByText('年级 / 届别')).toBeDefined();
    expect(screen.getByText('大三 (2023级)')).toBeDefined();
    expect(screen.getByText('电子邮箱')).toBeDefined();
    expect(screen.getByText('zhangwei@univ.edu.cn')).toBeDefined();
    expect(screen.getByText('手机号码')).toBeDefined();
    expect(screen.getByText('+86 138-0013-8000')).toBeDefined();
    expect(screen.getByText('紧急联系人')).toBeDefined();
    expect(screen.getByText('张建军 (+86 139-0013-9001)')).toBeDefined();
    expect(screen.queryByText('语言')).toBeNull();
  });

  it('triggers onBack when the close/back button is clicked at root level', () => {
    const onBackMock = vi.fn();
    renderWithProviders(<ProfileDetailsView isOpen={true} onBack={onBackMock} />);

    const backBtn = document.querySelector('md-icon-button');
    if (backBtn) {
      fireEvent.click(backBtn);
      expect(onBackMock).toHaveBeenCalledTimes(1);
    }
  });

  it('navigates to Name sub-view without nickname and legal name', () => {
    const onBackMock = vi.fn();
    renderWithProviders(<ProfileDetailsView isOpen={true} onBack={onBackMock} />);

    // Click on Name row
    const nameRow = screen.getByText('张伟');
    fireEvent.click(nameRow);

    // Check Name sub-view renders and does NOT have nickname or legal name
    expect(screen.getByText('谁可以看到您的姓名')).toBeDefined();
    expect(screen.queryByText('昵称')).toBeNull();
    expect(screen.queryByText('法定姓名')).toBeNull();

    // Click header back button - should navigate back to main list
    const backBtn = document.querySelector('md-icon-button');
    if (backBtn) {
      fireEvent.click(backBtn);
    }

    // Should return to main list and NOT call onBackMock yet
    expect(screen.getByText('个人资料')).toBeDefined();
    expect(onBackMock).not.toHaveBeenCalled();
  });

  it('navigates to Gender sub-view, changes gender (only male and female, no visibility section)', () => {
    renderWithProviders(<ProfileDetailsView isOpen={true} onBack={() => {}} />);

    // Click on Gender row
    const genderRow = screen.getByText('性别');
    fireEvent.click(genderRow);

    // Sub-view renders only male and female options, no visibility section
    expect(screen.getByText('女性')).toBeDefined();
    expect(screen.getByText('男性')).toBeDefined();
    expect(screen.queryByText('选择谁可以看到您的性别')).toBeNull();
    expect(screen.queryByText('不愿透露')).toBeNull();
    expect(screen.queryByText('添加自定义性别')).toBeNull();

    fireEvent.click(screen.getByText('女性'));

    // Go back
    const backBtn = document.querySelector('md-icon-button');
    if (backBtn) {
      fireEvent.click(backBtn);
    }
  });

  it('navigates to Birthday sub-view without visibility modifier section', () => {
    renderWithProviders(<ProfileDetailsView isOpen={true} onBack={() => {}} />);

    // Click on Birthday row
    const birthdayRow = screen.getByText('生日');
    fireEvent.click(birthdayRow);

    // Visibility section should not exist
    expect(screen.queryByText('选择谁可以看到您的生日')).toBeNull();
  });

  it('navigates to Identity sub-view and submits ethnicity and ID card', () => {
    renderWithProviders(<ProfileDetailsView isOpen={true} onBack={() => {}} />);

    const ethRow = screen.getByText('民族');
    fireEvent.click(ethRow);

    expect(screen.getAllByText('身份与民族特征').length).toBeGreaterThan(0);
    const ethField = document.querySelector('md-outlined-text-field[label="民族"]') as HTMLElement;
    (ethField as any).value = '回族';
    fireEvent(ethField, new Event('input', { bubbles: true, cancelable: true }));

    fireEvent.click(screen.getByText('保存'));
  });

  it('navigates to Academic sub-view', () => {
    renderWithProviders(<ProfileDetailsView isOpen={true} onBack={() => {}} />);

    const majorRow = screen.getByText('就读专业');
    fireEvent.click(majorRow);

    expect(screen.getByText('学籍与就读信息')).toBeDefined();
    const majorField = document.querySelector('md-outlined-text-field[label="就读专业"]') as HTMLElement;
    (majorField as any).value = '人工智能';
    fireEvent(majorField, new Event('input', { bubbles: true, cancelable: true }));

    fireEvent.click(screen.getByText('保存'));
  });

  it('navigates to Emergency Contact sub-view and submits contact update', () => {
    renderWithProviders(<ProfileDetailsView isOpen={true} onBack={() => {}} />);

    const emergencyRow = screen.getByText('紧急联系人');
    fireEvent.click(emergencyRow);

    expect(screen.getByText('安全与保密说明')).toBeDefined();
    const nameField = document.querySelector('md-outlined-text-field[label="联系人姓名"]') as HTMLElement;
    (nameField as any).value = '李秀英';
    fireEvent(nameField, new Event('input', { bubbles: true, cancelable: true }));

    fireEvent.click(screen.getByText('保存'));
  });

  it('navigates to Password sub-view, changes password', () => {
    renderWithProviders(<ProfileDetailsView isOpen={true} onBack={() => {}} />);

    // Click on Password row
    const passRow = screen.getByText('登录密码');
    fireEvent.click(passRow);

    const newPassField = document.querySelector('md-outlined-text-field[label="新密码"]') as HTMLElement;
    const confirmPassField = document.querySelector('md-outlined-text-field[label="确认新密码"]') as HTMLElement;

    expect(newPassField).toBeDefined();

    (newPassField as any).value = 'NewSecret123!';
    fireEvent(newPassField, new Event('input', { bubbles: true, cancelable: true }));

    (confirmPassField as any).value = 'NewSecret123!';
    fireEvent(confirmPassField, new Event('input', { bubbles: true, cancelable: true }));

    fireEvent.click(screen.getByText('更改密码'));
  });
});
