import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GenericDialog } from '../common/GenericDialog';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../common/Buttons';
import { useStudentBulkImport } from '../../hooks/useStudentBulkImport';
import { StudentBulkImportPreviewTable } from './StudentBulkImportPreviewTable';
import { StudentImportStatus } from '../../types/studentImport';

interface StudentBulkImportDialogProps {
  open: boolean;
  onClose: () => void;
}

type ImportStep = 'UPLOAD' | 'PREVIEW' | 'RESULT';
type FilterStatus = 'ALL' | StudentImportStatus;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0
  })
};

export function StudentBulkImportDialog({ open, onClose }: StudentBulkImportDialogProps) {
  const [step, setStep] = React.useState<ImportStep>('UPLOAD');
  const [direction, setDirection] = React.useState<number>(1);
  const [filterStatus, setFilterStatus] = React.useState<FilterStatus>('ALL');
  const [overwriteDuplicates, setOverwriteDuplicates] = React.useState<boolean>(false);
  const [isDragOver, setIsDragOver] = React.useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    downloadTemplate,
    previewCsv,
    commitImport,
    isPreviewLoading,
    isCommitLoading,
    previewData,
    commitData,
    resetPreview,
    resetCommit
  } = useStudentBulkImport();

  // Reset dialog state on close or open
  React.useEffect(() => {
    if (open) {
      setStep('UPLOAD');
      setDirection(1);
      setFilterStatus('ALL');
      setOverwriteDuplicates(false);
      resetPreview();
      resetCommit();
    }
  }, [open, resetPreview, resetCommit]);

  const handleFileChange = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('请上传 .csv 格式的文件');
      return;
    }
    try {
      await previewCsv(file);
      setDirection(1);
      setStep('PREVIEW');
    } catch {
      // Error handled by hook's snackbar
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleCommit = async () => {
    if (!previewData) return;
    try {
      await commitImport({
        rows: previewData.rows,
        overwriteDuplicates
      });
      setDirection(1);
      setStep('RESULT');
    } catch {
      // Error handled by hook's snackbar
    }
  };

  const filteredRows = React.useMemo(() => {
    if (!previewData?.rows) return [];
    if (filterStatus === 'ALL') return previewData.rows;
    return previewData.rows.filter((r) => r.status === filterStatus);
  }, [previewData, filterStatus]);

  const importableCount = React.useMemo(() => {
    if (!previewData) return 0;
    const ready = previewData.readyCount;
    const duplicates = overwriteDuplicates ? previewData.duplicateCount : 0;
    return ready + duplicates;
  }, [previewData, overwriteDuplicates]);

  // Dialog titles by step
  const getTitle = () => {
    switch (step) {
      case 'UPLOAD':
        return '全校学生档案批量导入';
      case 'PREVIEW':
        return '导入数据预览与核验';
      case 'RESULT':
        return '批量导入完成';
    }
  };

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={getTitle()}
      maxWidth="880px"
      isLoading={isPreviewLoading || isCommitLoading}
    >
      <div className="w-full relative min-h-[420px] flex flex-col overflow-hidden">
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          {step === 'UPLOAD' && (
            <motion.div
              key="upload"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="flex flex-col gap-6 py-2"
            >
              {/* Template download banner */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
                    {/* @ts-ignore */}
                    <md-icon className="text-[20px]">description</md-icon>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">
                      尚未准备好数据？下载官方标准 CSV 模板
                    </span>
                    <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">
                      包含标准中文字段表头及示例数据，开箱即用，支持 Excel / WPS 编辑
                    </span>
                  </div>
                </div>
                <SecondaryButton
                  icon="download"
                  label="下载 CSV 模板"
                  onClick={downloadTemplate}
                  noCollapse
                />
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer select-none ${
                  isDragOver
                    ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] bg-opacity-30 scale-[0.99]'
                    : 'border-[var(--md-sys-color-outline)] hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-low)] bg-[var(--md-sys-color-surface-container-lowest)]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-16 h-16 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] flex items-center justify-center mb-3">
                  {/* @ts-ignore */}
                  <md-icon className="text-[32px]">cloud_upload</md-icon>
                </div>
                <span className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)] mb-1">
                  点击选择或将 CSV 文件拖拽至此处
                </span>
                <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">
                  支持 UTF-8 (含BOM) 及 GBK 格式编码文件，单次最大支持 5,000 条
                </span>
              </div>

              {/* Import Notes & Format Rules */}
              <div className="flex flex-col gap-2 p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-lowest)] border border-[var(--md-sys-color-outline-variant)] border-opacity-50 text-[12px] text-[var(--md-sys-color-on-surface-variant)]">
                <span className="font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
                  {/* @ts-ignore */}
                  <md-icon className="text-[16px] text-[var(--md-sys-color-primary)]">info</md-icon>
                  导入规范与注意事项
                </span>
                <ul className="list-disc list-inside space-y-1 ml-1 leading-relaxed">
                  <li><strong className="text-[var(--md-sys-color-on-surface)]">必填字段</strong>：学号、姓名、专业、入学日期、身份证号（须为18位标准中国居民身份证号）。</li>
                  <li><strong className="text-[var(--md-sys-color-on-surface)]">专业映射</strong>：专业名称必须与系统中的现有专业名称完全一致（如：计算机科学、心理学等）。</li>
                  <li><strong className="text-[var(--md-sys-color-on-surface)]">导师工号</strong>：若填写班主任/辅导员工号，须与系统中的教师工号匹配。</li>
                  <li><strong className="text-[var(--md-sys-color-on-surface)]">账号与权限</strong>：新导入的学生将自动创建系统账号并初始化健康档案，无需手动分配。</li>
                </ul>
              </div>
            </motion.div>
          )}

          {step === 'PREVIEW' && previewData && (
            <motion.div
              key="preview"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="flex flex-col gap-4 py-1"
            >
              {/* KPI Summary Stat Cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="flex flex-col p-3 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
                  <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] font-medium">总读取记录</span>
                  <span className="text-[22px] font-bold text-[var(--md-sys-color-on-surface)] mt-0.5">{previewData.totalRows}</span>
                </div>
                <div className="flex flex-col p-3 rounded-2xl bg-[#dcfce7] dark:bg-[#14532d] border border-[#86efac] dark:border-[#166534]">
                  <span className="text-[12px] text-[#15803d] dark:text-[#86efac] font-medium">待导入 (就绪)</span>
                  <span className="text-[22px] font-bold text-[#15803d] dark:text-[#86efac] mt-0.5">{previewData.readyCount}</span>
                </div>
                <div className="flex flex-col p-3 rounded-2xl bg-[#fef3c7] dark:bg-[#78350f] border border-[#fde68a] dark:border-[#92400e]">
                  <span className="text-[12px] text-[#b45309] dark:text-[#fde68a] font-medium">已存在 (重复)</span>
                  <span className="text-[22px] font-bold text-[#b45309] dark:text-[#fde68a] mt-0.5">{previewData.duplicateCount}</span>
                </div>
                <div className="flex flex-col p-3 rounded-2xl bg-[#fee2e2] dark:bg-[#7f1d1d] border border-[#fca5a5] dark:border-[#991b1b]">
                  <span className="text-[12px] text-[#b91c1c] dark:text-[#fca5a5] font-medium">格式异常 (不可导入)</span>
                  <span className="text-[22px] font-bold text-[#b91c1c] dark:text-[#fca5a5] mt-0.5">{previewData.invalidCount}</span>
                </div>
              </div>

              {/* Filter Row & Checkbox */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Filter chips */}
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] font-medium">查看过滤:</span>
                  {(
                    [
                      { key: 'ALL', label: `全部 (${previewData.totalRows})` },
                      { key: 'READY', label: `待导入 (${previewData.readyCount})` },
                      { key: 'DUPLICATE', label: `已存在 (${previewData.duplicateCount})` },
                      { key: 'INVALID', label: `异常 (${previewData.invalidCount})` }
                    ] as const
                  ).map((tab) => {
                    const isSelected = filterStatus === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setFilterStatus(tab.key)}
                        className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm'
                            : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Overwrite Duplicate Checkbox */}
                {previewData.duplicateCount > 0 && (
                  <label className="flex items-center gap-2 cursor-pointer select-none bg-[var(--md-sys-color-surface-container)] px-3 py-1.5 rounded-xl border border-[var(--md-sys-color-outline-variant)]">
                    <input
                      type="checkbox"
                      checked={overwriteDuplicates}
                      onChange={(e) => setOverwriteDuplicates(e.target.checked)}
                      className="w-4 h-4 rounded text-[var(--md-sys-color-primary)] focus:ring-0 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-[12px] font-medium text-[var(--md-sys-color-on-surface)]">
                        更新已存在学生档案
                      </span>
                    </div>
                  </label>
                )}
              </div>

              {/* Preview Table */}
              <StudentBulkImportPreviewTable rows={filteredRows} />

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--md-sys-color-outline-variant)] border-opacity-40">
                <SecondaryButton
                  icon="arrow_back"
                  label="重新上传"
                  onClick={() => {
                    setDirection(-1);
                    setStep('UPLOAD');
                  }}
                  noCollapse
                />
                <div className="flex items-center gap-3">
                  <TertiaryButton label="取消" onClick={onClose} noCollapse />
                  <PrimaryButton
                    icon="file_download_done"
                    label={
                      isCommitLoading
                        ? '导入中...'
                        : `确认导入 (${importableCount} 条)`
                    }
                    onClick={handleCommit}
                    disabled={importableCount === 0 || isCommitLoading}
                    noCollapse
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 'RESULT' && commitData && (
            <motion.div
              key="result"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="flex flex-col items-center justify-center py-6 gap-6"
            >
              {/* Success badge */}
              <div className="w-16 h-16 rounded-full bg-[#dcfce7] dark:bg-[#14532d] text-[#15803d] dark:text-[#86efac] flex items-center justify-center">
                {/* @ts-ignore */}
                <md-icon className="text-[36px]">check_circle</md-icon>
              </div>

              <div className="flex flex-col items-center text-center">
                <h3 className="text-[20px] font-bold text-[var(--md-sys-color-on-surface)]">
                  学生档案批量导入完成
                </h3>
                <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
                  总共处理 {commitData.totalProcessed} 条数据，相关系统视图及档案列表已实时更新。
                </p>
              </div>

              {/* Result KPI Metrics Grid */}
              <div className="grid grid-cols-4 gap-3 w-full">
                <div className="flex flex-col items-center p-4 rounded-2xl bg-[#dcfce7] dark:bg-[#14532d] border border-[#86efac] dark:border-[#166534]">
                  <span className="text-[12px] text-[#15803d] dark:text-[#86efac] font-medium">成功导入 (新增)</span>
                  <span className="text-[26px] font-bold text-[#15803d] dark:text-[#86efac] mt-1">{commitData.importedCount}</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-2xl bg-[#eff6ff] dark:bg-[#1e3a8a] border border-[#bfdbfe] dark:border-[#1d4ed8]">
                  <span className="text-[12px] text-[#1d4ed8] dark:text-[#93c5fd] font-medium">成功更新 (覆盖)</span>
                  <span className="text-[26px] font-bold text-[#1d4ed8] dark:text-[#93c5fd] mt-1">{commitData.updatedCount}</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-2xl bg-[#fef3c7] dark:bg-[#78350f] border border-[#fde68a] dark:border-[#92400e]">
                  <span className="text-[12px] text-[#b45309] dark:text-[#fde68a] font-medium">跳过记录</span>
                  <span className="text-[26px] font-bold text-[#b45309] dark:text-[#fde68a] mt-1">{commitData.skippedCount}</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-2xl bg-[#fee2e2] dark:bg-[#7f1d1d] border border-[#fca5a5] dark:border-[#991b1b]">
                  <span className="text-[12px] text-[#b91c1c] dark:text-[#fca5a5] font-medium">异常失败</span>
                  <span className="text-[26px] font-bold text-[#b91c1c] dark:text-[#fca5a5] mt-1">{commitData.failedRows.length}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end w-full pt-4 border-t border-[var(--md-sys-color-outline-variant)] border-opacity-40">
                <PrimaryButton
                  label="完成"
                  icon="check"
                  onClick={onClose}
                  noCollapse
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GenericDialog>
  );
}
