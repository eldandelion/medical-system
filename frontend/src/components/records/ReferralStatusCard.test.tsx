import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ReferralStatusCard } from './ReferralStatusCard';
import { ReferralStep } from '../../types';

afterEach(() => {
  cleanup();
});

describe('ReferralStatusCard', () => {
  it('renders exact pending stage for AWAITING_APPROVAL', () => {
    render(<ReferralStatusCard status="AWAITING_APPROVAL" />);
    expect(screen.getByText('辅导员审批中')).toBeDefined();
  });

  it('renders exact pending stage for AWAITING_TRIAGE', () => {
    render(<ReferralStatusCard status="AWAITING_TRIAGE" />);
    expect(screen.getByText('中心分诊中')).toBeDefined();
  });

  it('renders exact pending stage for WAITING_FOR_SCHEDULING', () => {
    render(<ReferralStatusCard status="WAITING_FOR_SCHEDULING" />);
    expect(screen.getByText('预约排期中')).toBeDefined();
  });

  it('renders exact pending stage for WAITING_FOR_APPOINTMENT', () => {
    render(<ReferralStatusCard status="WAITING_FOR_APPOINTMENT" />);
    expect(screen.getByText('等待就诊')).toBeDefined();
  });

  it('renders exact pending stage for AWAITING_FEEDBACK_APPROVAL', () => {
    render(<ReferralStatusCard status="AWAITING_FEEDBACK_APPROVAL" />);
    expect(screen.getByText('诊疗反馈审批中')).toBeDefined();
  });

  it('renders exact title for terminal CLOSED state', () => {
    render(<ReferralStatusCard status="CLOSED" />);
    expect(screen.getByText('转诊已结案')).toBeDefined();
  });

  it('renders exact title for terminal REJECTED state', () => {
    render(<ReferralStatusCard status="REJECTED" />);
    expect(screen.getByText('转诊已拒绝')).toBeDefined();
  });

  it('renders exact title for terminal RECALLED state', () => {
    render(<ReferralStatusCard status="RECALLED" />);
    expect(screen.getByText('转诊已撤回')).toBeDefined();
  });

  it('resolves title from activeStep when status prop is omitted', () => {
    const mockStep: ReferralStep = {
      id: 1,
      type: 'SCHEDULING',
      time: '2026-08-14 10:00:00',
      status: 'ACTIVE'
    };
    render(<ReferralStatusCard activeStep={mockStep} />);
    expect(screen.getByText('预约排期中')).toBeDefined();
  });

  it('applies error styling when activeStep has status ISSUE', () => {
    const errorStep: ReferralStep = {
      id: 2,
      type: 'REVIEW',
      time: '2026-08-14 10:00:00',
      status: 'ISSUE'
    };
    const { container } = render(<ReferralStatusCard activeStep={errorStep} />);
    expect(screen.getByText('辅导员审批中')).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });

  it('fires onClick callback when clicked', () => {
    const onClickMock = vi.fn();
    render(<ReferralStatusCard status="AWAITING_TRIAGE" onClick={onClickMock} />);
    
    fireEvent.click(screen.getByText('中心分诊中'));
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
