import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useGlobalSearch } from '../../contexts/GlobalSearchContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { useGlobalSearchQuery } from '../../hooks/useGlobalSearchQuery';
import { getRoleActions, getRoleNavigations } from '../../config/searchActions';
import { FlatSearchItem, SearchActionItem } from '../../types/search';
import { STATUS_STYLES, STATUS_LABELS, RISK_LEVEL_STYLES, RISK_LEVEL_LABELS } from '../../config/styleConstants';

export function CommandPalette() {
  const { isOpen, query, setQuery, closeSearch } = useGlobalSearch();
  const { session } = useAuth();
  const { setTheme } = useTheme();
  const { navigateToTab } = useNavigation();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // TanStack Query for remote entity search (debounced 250ms internally)
  const { data: searchResults, isFetching } = useGlobalSearchQuery(query, 5);

  // Local actions and navigation items
  const actionContext = useMemo(
    () => ({
      navigateToTab,
      setTheme,
      closeSearch,
    }),
    [navigateToTab, setTheme, closeSearch]
  );

  const roleActions = useMemo(
    () => getRoleActions(session.role, actionContext),
    [session.role, actionContext]
  );

  const roleNavigations = useMemo(
    () => getRoleNavigations(session.role, actionContext),
    [session.role, actionContext]
  );

  // Filter actions & navigation by query keywords
  const matchedActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roleActions;
    return roleActions.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.subtitle?.toLowerCase().includes(q) ||
        a.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [roleActions, query]);

  const matchedNavigations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roleNavigations;
    return roleNavigations.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.subtitle?.toLowerCase().includes(q) ||
        n.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [roleNavigations, query]);

  // Flatten all items for linear keyboard navigation
  const flatItems: FlatSearchItem[] = useMemo(() => {
    const items: FlatSearchItem[] = [];

    // 1. Actions (if any matched)
    matchedActions.forEach((item) => items.push({ kind: 'action', item }));

    // 2. Navigations (if any matched)
    matchedNavigations.forEach((item) => items.push({ kind: 'navigation', item }));

    // 3. Students (remote)
    searchResults?.students?.forEach((item) => items.push({ kind: 'student', item }));

    // 4. Referrals (remote)
    searchResults?.referrals?.forEach((item) => items.push({ kind: 'referral', item }));

    // 5. Assessments (remote)
    searchResults?.assessments?.forEach((item) => items.push({ kind: 'assessment', item }));

    return items;
  }, [matchedActions, matchedNavigations, searchResults]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, searchResults]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Auto-scroll selected element into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedEl = listRef.current.querySelector<HTMLElement>('[data-selected="true"]');
    if (selectedEl && typeof selectedEl.scrollIntoView === 'function') {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (flatItems.length === 0) return;
      setSelectedIndex((prev) => (prev + 1) % flatItems.length);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (flatItems.length === 0) return;
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const current = flatItems[selectedIndex];
      if (!current) return;
      handleSelectItem(current);
    }
  };

  const handleSelectItem = (item: FlatSearchItem) => {
    closeSearch();
    switch (item.kind) {
      case 'action':
      case 'navigation':
        item.item.onSelect();
        break;
      case 'student':
        if (session.role === 'student') {
          navigateToTab('My Records', item.item.id);
        } else {
          navigateToTab('Students', item.item.id);
        }
        break;
      case 'referral':
        navigateToTab(session.role === 'student' ? 'My Records' : 'Referral Management', item.item.id);
        break;
      case 'assessment':
        navigateToTab('Assessments', item.item.id);
        break;
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeSearch}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-[28px] shadow-2xl border border-[var(--md-sys-color-outline-variant)]/40 overflow-hidden flex flex-col max-h-[75vh] z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="h-14 px-5 flex items-center gap-3 border-b border-[var(--md-sys-color-outline-variant)]/20 shrink-0">
              <span className="material-symbols-outlined text-[var(--md-sys-color-primary)] text-2xl">
                search
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索学生、转诊记录、测评量表或快捷操作 (支持 ↑ ↓ 键与回车)..."
                className="bg-transparent outline-none border-none ring-0 flex-1 placeholder:text-[var(--md-sys-color-on-surface-variant)] text-[var(--md-sys-color-on-surface)] text-base font-normal"
              />

              {isFetching && (
                <span className="material-symbols-outlined animate-spin text-[var(--md-sys-color-primary)] text-xl">
                  progress_activity
                </span>
              )}

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]"
                  title="清空"
                >
                  <span className="material-symbols-outlined text-lg leading-none">close</span>
                </button>
              )}

              <kbd className="px-2 py-0.5 text-xs font-mono rounded bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]/30">
                ESC
              </kbd>
            </div>

            {/* Results Body */}
            <div ref={listRef} className="overflow-y-auto p-2 space-y-4 max-h-[calc(75vh-56px)] custom-scrollbar">
              {flatItems.length === 0 && !isFetching && (
                <div className="py-12 flex flex-col items-center justify-center text-center text-[var(--md-sys-color-on-surface-variant)]">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                  <p className="text-sm">未找到相关结果</p>
                  <p className="text-xs opacity-70 mt-1">尝试搜索其他学生姓名、学号、转诊主题或量表代码</p>
                </div>
              )}

              {/* 1. Quick Actions */}
              {matchedActions.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] tracking-wider">
                    快捷操作
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {matchedActions.map((action) => {
                      const itemIndex = flatItems.findIndex((fi) => fi.kind === 'action' && fi.item.id === action.id);
                      const isSelected = itemIndex === selectedIndex;
                      return (
                        <div
                          key={action.id}
                          data-selected={isSelected}
                          onClick={() => handleSelectItem({ kind: 'action', item: action })}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                              : 'hover:bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="material-symbols-outlined text-[var(--md-sys-color-primary)] text-xl shrink-0">
                              {action.icon}
                            </span>
                            <div className="truncate">
                              <div className="text-sm font-medium">{action.title}</div>
                              {action.subtitle && (
                                <div className="text-xs opacity-75 truncate">{action.subtitle}</div>
                              )}
                            </div>
                          </div>
                          {action.badge && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] font-medium shrink-0 ml-2">
                              {action.badge}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Page Navigation */}
              {matchedNavigations.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] tracking-wider">
                    系统导航
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {matchedNavigations.map((nav) => {
                      const itemIndex = flatItems.findIndex((fi) => fi.kind === 'navigation' && fi.item.id === nav.id);
                      const isSelected = itemIndex === selectedIndex;
                      return (
                        <div
                          key={nav.id}
                          data-selected={isSelected}
                          onClick={() => handleSelectItem({ kind: 'navigation', item: nav })}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                              : 'hover:bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="material-symbols-outlined text-[var(--md-sys-color-secondary)] text-xl shrink-0">
                              {nav.icon}
                            </span>
                            <div className="truncate">
                              <div className="text-sm font-medium">{nav.title}</div>
                              {nav.subtitle && (
                                <div className="text-xs opacity-75 truncate">{nav.subtitle}</div>
                              )}
                            </div>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] font-medium shrink-0 ml-2">
                            导航
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Students (Role-Scoped) */}
              {searchResults?.students && searchResults.students.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] tracking-wider">
                    学生档案 (仅限本人管辖/可见范围)
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {searchResults.students.map((student) => {
                      const itemIndex = flatItems.findIndex((fi) => fi.kind === 'student' && fi.item.id === student.id);
                      const isSelected = itemIndex === selectedIndex;
                      return (
                        <div
                          key={`student-${student.id}`}
                          data-selected={isSelected}
                          onClick={() => handleSelectItem({ kind: 'student', item: student })}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                              : 'hover:bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-xs font-medium shrink-0">
                              {student.name.charAt(0)}
                            </div>
                            <div className="truncate">
                              <div className="text-sm font-medium flex items-center gap-2">
                                <span>{student.name}</span>
                                <span className="text-xs opacity-70 font-mono">{student.studentNumber}</span>
                              </div>
                              <div className="text-xs opacity-75 truncate">
                                {student.majorName || '未分配专业'}
                                {student.collegeName ? ` · ${student.collegeName}` : ''}
                              </div>
                            </div>
                          </div>

                          {student.riskLevel && (
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${
                                RISK_LEVEL_STYLES[student.riskLevel] || ''
                              }`}
                            >
                              风险: {RISK_LEVEL_LABELS[student.riskLevel] || student.riskLevel}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Referrals (Role-Scoped) */}
              {searchResults?.referrals && searchResults.referrals.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] tracking-wider">
                    就诊转诊记录 (仅限权限范围内工单)
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {searchResults.referrals.map((referral) => {
                      const itemIndex = flatItems.findIndex((fi) => fi.kind === 'referral' && fi.item.id === referral.id);
                      const isSelected = itemIndex === selectedIndex;
                      const statusStyle = STATUS_STYLES[referral.status] || STATUS_STYLES.default;
                      const statusLabel = STATUS_LABELS[referral.status] || referral.status;
                      return (
                        <div
                          key={`referral-${referral.id}`}
                          data-selected={isSelected}
                          onClick={() => handleSelectItem({ kind: 'referral', item: referral })}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                              : 'hover:bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="material-symbols-outlined text-[var(--md-sys-color-tertiary)] text-xl shrink-0">
                              swap_horiz
                            </span>
                            <div className="truncate">
                              <div className="text-sm font-medium flex items-center gap-2">
                                <span>{referral.title}</span>
                                {referral.studentName && (
                                  <span className="text-xs opacity-75">({referral.studentName})</span>
                                )}
                              </div>
                              <div className="text-xs opacity-75 truncate">
                                {referral.descriptionSnippet}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {referral.riskLevel && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  RISK_LEVEL_STYLES[referral.riskLevel] || ''
                                }`}
                              >
                                {RISK_LEVEL_LABELS[referral.riskLevel] || referral.riskLevel}
                              </span>
                            )}
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusStyle}`}>
                              {statusLabel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Assessments */}
              {searchResults?.assessments && searchResults.assessments.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] tracking-wider">
                    心理测评与量表库
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {searchResults.assessments.map((assessment) => {
                      const itemIndex = flatItems.findIndex((fi) => fi.kind === 'assessment' && fi.item.id === assessment.id);
                      const isSelected = itemIndex === selectedIndex;
                      return (
                        <div
                          key={`assessment-${assessment.id}`}
                          data-selected={isSelected}
                          onClick={() => handleSelectItem({ kind: 'assessment', item: assessment })}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                              : 'hover:bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="material-symbols-outlined text-[var(--md-sys-color-primary)] text-xl shrink-0">
                              quiz
                            </span>
                            <div className="truncate">
                              <div className="text-sm font-medium flex items-center gap-2">
                                <span>{assessment.title}</span>
                                <span className="text-xs uppercase font-mono px-1 rounded bg-[var(--md-sys-color-surface-container-highest)]">
                                  {assessment.batteryCode}
                                </span>
                              </div>
                              {assessment.subtitle && (
                                <div className="text-xs opacity-75 truncate">{assessment.subtitle}</div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {assessment.duration && (
                              <span className="text-[11px] opacity-75">{assessment.duration}</span>
                            )}
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-highest)] font-medium">
                              {assessment.resultType === 'ASSIGNMENT' ? '指派测评' : '标准量表'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation Bar */}
            <div className="h-10 px-4 bg-[var(--md-sys-color-surface-container)] border-t border-[var(--md-sys-color-outline-variant)]/20 flex items-center justify-between text-xs text-[var(--md-sys-color-on-surface-variant)] shrink-0">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container-high)] text-[10px] font-mono shadow-xs">
                    ↑
                  </kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container-high)] text-[10px] font-mono shadow-xs">
                    ↓
                  </kbd>
                  <span>选择</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container-high)] text-[10px] font-mono shadow-xs">
                    ↵
                  </kbd>
                  <span>确认跳转</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container-high)] text-[10px] font-mono shadow-xs">
                    ESC
                  </kbd>
                  <span>关闭</span>
                </span>
              </div>
              <div className="text-[11px] opacity-70">
                身份视角: {session.role} · 严防跨角色数据渗透
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
