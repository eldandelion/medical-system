/**
 * Referral Context & State Management
 * Provides scoped student referral data, defensive ACL filtering, and header sync
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { intakeApi, ReferralDto } from '../api/intakeApi';
import { ReferralFilter } from '../utils/referralConstants';
import { ReferralDetailsTab } from '../utils/referralRouting';
import { useOptionalAuth } from './AuthContext';

const EXCLUDED_STATUSES = new Set(['DRAFT', 'RECALLED']);
const CLOSED_STATUSES = new Set(['CLOSED', 'REJECTED', 'ERROR']);

export interface ReferralContextValue {
  referrals: ReferralDto[];
  filteredReferrals: ReferralDto[];
  filter: ReferralFilter;
  setFilter: (filter: ReferralFilter) => void;
  totalCount: number;
  inProgressCount: number;
  closedCount: number;
  loading: boolean;
  error: string | null;
  isScrolled: boolean;
  setIsScrolled: (isScrolled: boolean) => void;
  selectedReferralId: string | null;
  setSelectedReferralId: (id: string | null) => void;
  activeDetailsTab: ReferralDetailsTab;
  setActiveDetailsTab: (tab: ReferralDetailsTab) => void;
  refreshReferrals: () => Promise<void>;
}

export const ReferralContext = createContext<ReferralContextValue | undefined>(undefined);

export const ReferralProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useOptionalAuth();
  const student = auth?.student;

  const [rawReferrals, setRawReferrals] = useState<ReferralDto[]>([]);
  const [filter, setFilter] = useState<ReferralFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedReferralId, setSelectedReferralId] = useState<string | null>(null);
  const [activeDetailsTab, setActiveDetailsTab] = useState<ReferralDetailsTab>('overview');

  const fetchReferrals = useCallback(async () => {
    // If AuthProvider is present and student is not logged in, clear state and skip network request
    if (auth && !student) {
      setRawReferrals([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await intakeApi.getReferrals();
      setRawReferrals(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '获取转诊记录失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [auth, student]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  // Defensive filtering: student must never see drafts or recalled items
  const referrals = useMemo(() => {
    return rawReferrals.filter((item) => !EXCLUDED_STATUSES.has(item.status));
  }, [rawReferrals]);

  // Status counters
  const { inProgressCount, closedCount } = useMemo(() => {
    let inProgress = 0;
    let closed = 0;
    for (const item of referrals) {
      if (CLOSED_STATUSES.has(item.status)) {
        closed += 1;
      } else {
        inProgress += 1;
      }
    }
    return { inProgressCount: inProgress, closedCount: closed };
  }, [referrals]);

  const totalCount = referrals.length;

  // Filtered referrals list for UI presentation
  const filteredReferrals = useMemo(() => {
    if (filter === 'in_progress') {
      return referrals.filter((item) => !CLOSED_STATUSES.has(item.status));
    }
    if (filter === 'closed') {
      return referrals.filter((item) => CLOSED_STATUSES.has(item.status));
    }
    return referrals;
  }, [referrals, filter]);

  const value = useMemo<ReferralContextValue>(
    () => ({
      referrals,
      filteredReferrals,
      filter,
      setFilter,
      totalCount,
      inProgressCount,
      closedCount,
      loading,
      error,
      isScrolled,
      setIsScrolled,
      selectedReferralId,
      setSelectedReferralId,
      activeDetailsTab,
      setActiveDetailsTab,
      refreshReferrals: fetchReferrals,
    }),
    [
      referrals,
      filteredReferrals,
      filter,
      totalCount,
      inProgressCount,
      closedCount,
      loading,
      error,
      isScrolled,
      selectedReferralId,
      activeDetailsTab,
      fetchReferrals,
    ]
  );

  return <ReferralContext.Provider value={value}>{children}</ReferralContext.Provider>;
};

export function useReferrals(): ReferralContextValue {
  const context = useContext(ReferralContext);
  if (!context) {
    throw new Error('useReferrals must be used within a ReferralProvider');
  }
  return context;
}
