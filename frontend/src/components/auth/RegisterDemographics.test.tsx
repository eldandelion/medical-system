import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RegisterDemographics, ETHNICITY_OPTIONS } from './RegisterDemographics';

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
      {ui}
    </QueryClientProvider>
  );
};

function setMdInputValue(field: HTMLElement, value: string) {
  (field as any).value = value;
  fireEvent(field, new Event('input', { bubbles: true, cancelable: true }));
}

function setMdSelectValue(select: HTMLElement, value: string) {
  (select as any).value = value;
  fireEvent(select, new Event('change', { bubbles: true, cancelable: true }));
}

describe('RegisterDemographics Component', () => {
  it('renders CSU branding, title, subtitle, date of birth inputs, and ethnicity select', () => {
    renderWithProviders(
      <RegisterDemographics
        onBack={() => {}}
        onProceed={() => {}}
      />
    );

    expect(screen.getByText('CSU')).toBeDefined();
    expect(screen.getByText('基本信息')).toBeDefined();
    expect(screen.getByText('输入您的出生日期和民族')).toBeDefined();

    // Date of birth 3 fields
    const monthSelect = document.querySelector('md-outlined-select[label="月"]');
    expect(monthSelect).toBeDefined();

    const dayField = document.querySelector('md-outlined-text-field[label="日"]');
    expect(dayField).toBeDefined();

    const yearField = document.querySelector('md-outlined-text-field[label="年"]');
    expect(yearField).toBeDefined();

    // Ethnicity select
    const ethnicitySelect = document.querySelector('md-outlined-select[label="民族"]');
    expect(ethnicitySelect).toBeDefined();
    expect(ETHNICITY_OPTIONS).toContain('汉族');

    expect(screen.getByText('返回')).toBeDefined();
    expect(screen.getByText('下一步')).toBeDefined();
  });

  it('shows error when submitting with incomplete date of birth or ethnicity', () => {
    const onProceedMock = vi.fn();
    renderWithProviders(
      <RegisterDemographics
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(screen.getByText('请完整输入出生日期的年、月、日')).toBeDefined();
    expect(screen.getByText('请选择民族')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('validates date of birth ranges and leap years / month bounds', () => {
    const onProceedMock = vi.fn();
    renderWithProviders(
      <RegisterDemographics
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const monthSelect = document.querySelector('md-outlined-select[label="月"]') as HTMLElement;
    const dayField = document.querySelector('md-outlined-text-field[label="日"]') as HTMLElement;
    const yearField = document.querySelector('md-outlined-text-field[label="年"]') as HTMLElement;
    const ethnicitySelect = document.querySelector('md-outlined-select[label="民族"]') as HTMLElement;

    // Test invalid day for February in non-leap year (1999-02-30)
    setMdSelectValue(monthSelect, '2');
    setMdInputValue(dayField, '30');
    setMdInputValue(yearField, '1999');
    setMdSelectValue(ethnicitySelect, '汉族');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(screen.getByText('请输入有效的日期 (该月最大天数为 28 日)')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('submits correctly when valid date of birth and ethnicity are entered', () => {
    const onProceedMock = vi.fn();
    renderWithProviders(
      <RegisterDemographics
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const monthSelect = document.querySelector('md-outlined-select[label="月"]') as HTMLElement;
    const dayField = document.querySelector('md-outlined-text-field[label="日"]') as HTMLElement;
    const yearField = document.querySelector('md-outlined-text-field[label="年"]') as HTMLElement;
    const ethnicitySelect = document.querySelector('md-outlined-select[label="民族"]') as HTMLElement;

    setMdSelectValue(monthSelect, '5');
    setMdInputValue(dayField, '12');
    setMdInputValue(yearField, '2004');
    setMdSelectValue(ethnicitySelect, '汉族');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(onProceedMock).toHaveBeenCalledWith({
      year: '2004',
      month: '5',
      day: '12',
      dateOfBirth: '2004-05-12',
      ethnicity: '汉族',
    });
  });

  it('validates working age bounds (<18 or >100 years old)', () => {
    const onProceedMock = vi.fn();
    renderWithProviders(
      <RegisterDemographics
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const monthSelect = document.querySelector('md-outlined-select[label="月"]') as HTMLElement;
    const dayField = document.querySelector('md-outlined-text-field[label="日"]') as HTMLElement;
    const yearField = document.querySelector('md-outlined-text-field[label="年"]') as HTMLElement;
    const ethnicitySelect = document.querySelector('md-outlined-select[label="民族"]') as HTMLElement;

    const currentYear = new Date().getFullYear();

    // Test underage (e.g. 10 years old)
    setMdSelectValue(monthSelect, '5');
    setMdInputValue(dayField, '12');
    setMdInputValue(yearField, String(currentYear - 10));
    setMdSelectValue(ethnicitySelect, '汉族');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(screen.getByText(`请输入有效的年份 (${currentYear - 100}-${currentYear - 18})`)).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('accepts Feb 29 on leap year (2000)', () => {
    const onProceedMock = vi.fn();
    renderWithProviders(
      <RegisterDemographics
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const monthSelect = document.querySelector('md-outlined-select[label="月"]') as HTMLElement;
    const dayField = document.querySelector('md-outlined-text-field[label="日"]') as HTMLElement;
    const yearField = document.querySelector('md-outlined-text-field[label="年"]') as HTMLElement;
    const ethnicitySelect = document.querySelector('md-outlined-select[label="民族"]') as HTMLElement;

    setMdSelectValue(monthSelect, '2');
    setMdInputValue(dayField, '29');
    setMdInputValue(yearField, '2000');
    setMdSelectValue(ethnicitySelect, '汉族');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(onProceedMock).toHaveBeenCalledWith({
      year: '2000',
      month: '2',
      day: '29',
      dateOfBirth: '2000-02-29',
      ethnicity: '汉族',
    });
  });

  it('calls onBack when clicking "返回"', () => {
    const onBackMock = vi.fn();
    renderWithProviders(
      <RegisterDemographics
        onBack={onBackMock}
        onProceed={() => {}}
      />
    );

    const backButton = screen.getByText('返回');
    fireEvent.click(backButton);

    expect(onBackMock).toHaveBeenCalledTimes(1);
  });
});
