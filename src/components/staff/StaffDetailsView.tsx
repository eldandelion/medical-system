import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DetailsSection, DetailItem } from '../common/DetailsPanel';
import { PrimaryButton, SecondaryButton } from '../common/Buttons';
import { ActionFooter } from '../common/ActionFooter';
import { useCreationOverlay } from '../../contexts/CreationContext';

interface Counselor {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  activeCaseload: number;
  status: 'Active' | 'Inactive' | 'Suspended';
}

interface StaffDetailsViewProps {
  staff: Counselor;
}

type TabType = 'caseload' | 'audit' | 'scopes';

export function StaffDetailsView({ staff }: StaffDetailsViewProps) {
  const [activeTab, setActiveTab] = React.useState<TabType>('caseload');
  const [selectedCaseloadIds, setSelectedCaseloadIds] = React.useState<string[]>([]);
  const { openCreation, closeCreation } = useCreationOverlay();

  const tabs = [
    { id: 'caseload', label: '负责学生', icon: 'group' },
    { id: 'audit', label: '操作日志', icon: 'history' },
    { id: 'scopes', label: '权限范围', icon: 'admin_panel_settings' },
  ];

  // Mock data for tabs
  const caseload = [
    { id: 's1', name: 'Daniil Petrov', type: '高风险转诊', date: '2026年4月22日' },
    { id: 's2', name: 'Alice Smith', type: '日常维护', date: '2026年4月20日' },
    { id: 's3', name: 'James Wilson', type: '初诊接诊', date: '2026年4月18日' }
  ];

  const auditLogs = [
    { id: 'l1', action: '导出了转诊列表', time: '2小时前', context: '医学院' },
    { id: 'l2', action: '查看了个人资料', time: '5小时前', context: 'ID: 987654321' },
    { id: 'l3', action: '修改了知情同意状态', time: '昨天', context: '学生：Daniil Petrov' }
  ];

  const departments = ['医学', '工程', '经济', '艺术', '理学', '法学'];
  const [authorizedDepartments, setAuthorizedDepartments] = React.useState(['医学', '工程']);

  const toggleCaseload = (id: string) => {
    setSelectedCaseloadIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleReassign = () => {
    openCreation(
      '重新分配工作量',
      <div className="p-6">
        <h3 className="text-[18px] font-medium mb-4">选择目标咨询师</h3>
        <div className="flex flex-col gap-3">
          {['李娜', '王明', '陈佳'].map(name => (
            <div
              key={name}
              onClick={closeCreation}
              className="p-4 rounded-xl border border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] cursor-pointer flex justify-between items-center"
            >
              <span className="font-medium text-[var(--md-sys-color-on-surface)]">{name}</span>
              <span className="material-symbols-outlined text-[var(--md-sys-color-primary)]">chevron_right</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[var(--md-sys-color-surface)]">
      {/* Identity Block */}
      <div className="p-6 pb-4 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-3xl font-medium shrink-0 uppercase">
            {staff.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <h1 className="text-[24px] leading-[32px] font-medium text-[var(--md-sys-color-on-surface)] tracking-tight">
              {staff.name}
            </h1>
            <div className="flex items-center gap-2 text-[14px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
              <span className="font-mono text-[13px] tracking-tight text-[var(--md-sys-color-primary)] font-bold">{staff.employeeId}</span>
              <span className="opacity-40">•</span>
              <span className="font-medium">{staff.department}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30 px-2 shrink-0 bg-[var(--md-sys-color-surface)] sticky top-0 z-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 flex flex-col items-center py-4 px-1 gap-1 transition-all relative ${activeTab === tab.id
                ? 'text-[var(--md-sys-color-primary)]'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)] hover:bg-opacity-40'
              }`}
          >
            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
            <span className="text-[11px] font-bold whitespace-nowrap">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeStaffTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--md-sys-color-primary)] rounded-t-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 custom-scrollbar pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'caseload' && (
            <motion.div
              key="caseload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <div className="flex justify-between items-center mb-1 pr-1">
                <span className="text-[12px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-widest opacity-70">
                  {selectedCaseloadIds.length > 0 ? `已选择 ${selectedCaseloadIds.length} 项` : '活跃工作负荷'}
                </span>
                {selectedCaseloadIds.length > 0 && (
                  <button
                    onClick={handleReassign}
                    className="text-[var(--md-sys-color-primary)] text-[12px] font-bold hover:underline uppercase tracking-widest"
                  >
                    重新分配所选
                  </button>
                )}
              </div>
              <div className="flex flex-col bg-[var(--md-sys-color-surface-container-lowest)] rounded-2xl overflow-hidden border border-[var(--md-sys-color-outline-variant)] border-opacity-30">
                {caseload.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleCaseload(item.id)}
                    className={`flex items-center gap-4 px-4 py-4 border-b border-[var(--md-sys-color-outline-variant)] border-opacity-20 last:border-0 hover:bg-[var(--md-sys-color-surface-container-low)] cursor-pointer transition-colors ${selectedCaseloadIds.includes(item.id) ? 'bg-[var(--md-sys-color-primary-container)] bg-opacity-30' : ''}`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${selectedCaseloadIds.includes(item.id) ? 'bg-[var(--md-sys-color-primary)] border-[var(--md-sys-color-primary)]' : 'border-[var(--md-sys-color-outline)]'}`}>
                      {selectedCaseloadIds.includes(item.id) && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[15px] font-medium text-[var(--md-sys-color-on-surface)] truncate">{item.name}</span>
                      <div className="flex items-center gap-1.5 text-[12px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                        <span className="font-medium text-[var(--md-sys-color-secondary)]">{item.type}</span>
                        <span className="opacity-40">•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              <h4 className="text-[12px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-widest opacity-70">操作历史记录</h4>
              <div className="relative pl-6 flex flex-col gap-8 before:content-[''] before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--md-sys-color-outline-variant)] before:opacity-30">
                {auditLogs.map(log => (
                  <div key={log.id} className="relative flex flex-col gap-1.5">
                    <div className="absolute left-[-27.5px] top-1.5 w-3 h-3 rounded-full border-2 border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-surface)] z-10" />
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">{log.action}</span>
                      <span className="text-[11px] font-bold text-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] px-2 py-0.5 rounded-md self-start">
                        {log.time}
                      </span>
                    </div>
                    <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container-low)] p-2 rounded-lg inline-block self-start">
                      {log.context}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'scopes' && (
            <motion.div
              key="scopes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-widest opacity-70">授权院系</span>
                <p className="text-[13px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                  咨询师仅限于在其指定的学术范围内查看学生记录和分诊数据。
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {departments.map(dept => {
                  const isSelected = authorizedDepartments.includes(dept);
                  return (
                    <div
                      key={dept}
                      onClick={() => setAuthorizedDepartments(prev =>
                        prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
                      )}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-[14px] font-medium transition-all cursor-pointer ${isSelected
                          ? 'bg-[var(--md-sys-color-primary-container)] border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary-container)] shadow-sm'
                          : 'bg-transparent border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-low)]'
                        }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isSelected ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                      {dept}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Footer */}
      <ActionFooter>
        <PrimaryButton
          icon="block"
          label="暂停访问"
          onClick={() => { }}
          style={{
            '--md-filled-button-container-color': 'var(--md-sys-color-error)',
            '--md-filled-button-label-text-color': 'var(--md-sys-color-on-error)',
            '--md-filled-button-icon-color': 'var(--md-sys-color-on-error)',
            '--md-filled-button-pressed-state-layer-color': 'var(--md-sys-color-on-error)',
            '--md-filled-button-hover-state-layer-color': 'var(--md-sys-color-on-error)',
            '--md-filled-button-focus-state-layer-color': 'var(--md-sys-color-on-error)',
          } as React.CSSProperties}
        />
        <SecondaryButton
          icon="lock_reset"
          label="重置登录凭据"
          onClick={() => { }}
        />
      </ActionFooter>
    </div>
  );
}
