import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReferralCard } from './ReferralCard';
import { ReferralDto } from '../../api/intakeApi';

describe('ReferralCard', () => {
  const mockReferral: ReferralDto = {
    id: 'ref-101',
    studentId: 1,
    studentName: '李同学',
    studentNumber: '20230001',
    type: 'INITIAL',
    date: '2026-10-31T14:30:00',
    title: '期末考前重度焦虑与失眠',
    description: '学生连续两周失眠，伴随心悸',
    riskLevel: 'HIGH',
    status: 'WAITING_FOR_SCHEDULING',
    referredBy: { name: '赵辅导员' },
    availableActions: [],
  };

  it('renders status pill, risk chip, referral type label, title, and formatted date', () => {
    render(<ReferralCard referral={mockReferral} />);

    expect(screen.getByText('待排诊')).toBeDefined();
    expect(screen.getByText('高风险')).toBeDefined();
    expect(screen.getByText('初次转诊')).toBeDefined();
    expect(screen.getByText('期末考前重度焦虑与失眠')).toBeDefined();
    expect(screen.getByText('学生连续两周失眠，伴随心悸')).toBeDefined();
    expect(screen.getByText(/赵辅导员/)).toBeDefined();
    expect(screen.getByText(/2026-10-31/)).toBeDefined();
  });

  it('tapping card invokes onClick callback', () => {
    const onClick = vi.fn();
    render(<ReferralCard referral={mockReferral} onClick={onClick} />);

    fireEvent.click(screen.getByText('期末考前重度焦虑与失眠'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('tapping status pill invokes onStatusClick and stops click propagation', () => {
    const onClick = vi.fn();
    const onStatusClick = vi.fn();

    render(
      <ReferralCard
        referral={mockReferral}
        onClick={onClick}
        onStatusClick={onStatusClick}
      />
    );

    const statusPill = screen.getByText('待排诊');
    fireEvent.click(statusPill);

    expect(onStatusClick).toHaveBeenCalledWith('WAITING_FOR_SCHEDULING');
    expect(onClick).not.toHaveBeenCalled();
  });
});
