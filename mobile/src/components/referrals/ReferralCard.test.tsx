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

  it('renders card container without border outline or elevation shadow', () => {
    const { container } = render(<ReferralCard referral={mockReferral} />);
    const card = container.firstElementChild as HTMLElement;

    expect(card).not.toBeNull();
    expect(card.className).toContain('rounded-2xl');
    expect(card.className).toContain('bg-[var(--md-sys-color-surface-container-low)]');
    expect(card.className).not.toContain('border');
    expect(card.className).not.toContain('shadow');
  });

  it('renders circular placeholder avatar badge with initiator first letter instead of person icon', () => {
    render(<ReferralCard referral={mockReferral} />);

    // '赵辅导员' -> first letter '赵'
    const avatarBadge = screen.getByText('赵');
    expect(avatarBadge).toBeDefined();
    expect(avatarBadge.className).toContain('rounded-full');
    expect(avatarBadge.className).toContain('size-[18px]');
    expect(avatarBadge.className).toContain('bg-[var(--md-sys-color-primary-container)]');
    expect(avatarBadge.className).toContain('text-[var(--md-sys-color-on-primary-container)]');

    // Assert that the old 'person' text icon is NOT rendered
    expect(screen.queryByText('person')).toBeNull();
  });

  it('renders non-BMP Unicode codepoints properly without surrogate fragmentation', () => {
    const astralReferral: ReferralDto = {
      ...mockReferral,
      referredBy: { name: '𠮷辅导员' },
    };
    render(<ReferralCard referral={astralReferral} />);

    // Astral CJK char '𠮷' (U+20BB7)
    const avatarBadge = screen.getByText('𠮷');
    expect(avatarBadge).toBeDefined();
    expect(avatarBadge.textContent).toBe('𠮷');
  });

  it('does not render initiator avatar badge when name is whitespace or missing', () => {
    const emptyNameReferral: ReferralDto = {
      ...mockReferral,
      referredBy: { name: '   ' },
    };
    const { rerender } = render(<ReferralCard referral={emptyNameReferral} />);
    expect(screen.queryByText(/发起:/)).toBeNull();

    const missingReferral: ReferralDto = {
      ...mockReferral,
      referredBy: { name: '' },
    };
    rerender(<ReferralCard referral={missingReferral} />);
    expect(screen.queryByText(/发起:/)).toBeNull();
  });

  it('uses material-symbols-outlined for all icon glyph spans with zero material-symbols-rounded', () => {
    const { container } = render(<ReferralCard referral={mockReferral} />);

    expect(container.querySelectorAll('.material-symbols-rounded').length).toBe(0);
    expect(container.querySelectorAll('.material-symbols-outlined').length).toBeGreaterThan(0);
  });
});
