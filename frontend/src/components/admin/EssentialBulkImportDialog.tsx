import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GenericDialog } from '../common/GenericDialog';
import { PrimaryButton, OutlinedButton, TertiaryButton } from '../common/Buttons';
import { useReferenceBulkImport } from '../../hooks/useReferenceBulkImport';
import { EssentialBulkImportPreviewTable } from './EssentialBulkImportPreviewTable';
import { ReferenceCategory, REFERENCE_CATEGORIES } from '../../types/references';

interface EssentialBulkImportDialogProps {
  open: boolean;
  initialCategory?: ReferenceCategory;
  onClose: () => void;
}

type ImportStep = 'UPLOAD' | 'PREVIEW' | 'RESULT';
type FilterStatus = 'ALL' | 'READY' | 'DUPLICATE' | 'INVALID';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0,
  }),
};

export function EssentialBulkImportDialog({
  open,
  initialCategory = 'COLLEGE',
  onClose,
}: EssentialBulkImportDialogProps) {
  const [category, setCategory] = React.useState<ReferenceCategory>(initialCategory);
  const [step, setStep] = React.useState<ImportStep>('UPLOAD');
  const [direction, setDirection] = React.useState<number>(1);
  const [filterStatus, setFilterStatus] = React.useState<FilterStatus>('ALL');
  const [overwriteDuplicates, setOverwriteDuplicates] = React.useState<boolean>(false);
  const [isDragOver, setIsDragOver] = React.useState<boolean>(false);
  const [isDiscardWarningOpen, setIsDiscardWarningOpen] = React.useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    downloadTemplate,
    previewCsv,
    commitImport,
    isPreviewLoading,
    isCommitLoading,
    isDownloadingTemplate,
    previewData,
    commitData,
    resetPreview,
    resetCommit,
  } = useReferenceBulkImport();

  const currentMeta = REFERENCE_CATEGORIES.find((c) => c.key === category)!;

  React.useEffect(() => {
    if (open) {
      setCategory(initialCategory);
      setStep('UPLOAD');
      setDirection(1);
      setFilterStatus('ALL');
      setOverwriteDuplicates(false);
      setIsDiscardWarningOpen(false);
      resetPreview();
      resetCommit();
    }
  }, [open, initialCategory, resetPreview, resetCommit]);

  const handleCloseAttempt = () => {
    if (step === 'PREVIEW') {
      setIsDiscardWarningOpen(true);
    } else {
      onClose();
    }
  };

  const handleFileChange = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('请上传 .csv 格式的文件');
      return;
    }
    try {
      await previewCsv(category, file);
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
      await commitImport(category, previewData.rows, overwriteDuplicates);
      setDirection(1);
      setStep('RESULT');
    } catch {
      // Handled by hook
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

  const chipSetRef = React.useRef<HTMLElement>(null);

  const handleCategoryChipClick = (catKey: ReferenceCategory, e: React.MouseEvent<HTMLElement>) => {
    if (category === catKey) {
      e.preventDefault();
      (e.currentTarget as any).selected = true;
      return;
    }
    setCategory(catKey);
    resetPreview();
  };

  React.useEffect(() => {
    if (!chipSetRef.current) return;
    const chips = chipSetRef.current.querySelectorAll('md-filter-chip');
    chips.forEach((chip: any) => {
      const catKey = chip.dataset.categoryKey as ReferenceCategory;
      const shouldBeSelected = category === catKey;
      if (chip.selected !== shouldBeSelected) {
        chip.selected = shouldBeSelected;
      }
    });
  }, [category, step]);

  const getTitle = () => {
    switch (step) {
      case 'UPLOAD':
        return '基础数据批量导入';
      case 'PREVIEW':
        return `导入数据预览与核验 (${currentMeta.singularTitle})`;
      case 'RESULT':
        return `${currentMeta.title}批量导入完成`;
    }
  };

  return (
    <>
      <GenericDialog
        open={open}
        onClose={handleCloseAttempt}
        title={getTitle()}
        headerRight={
          step === 'UPLOAD' ? (
            /* @ts-ignore */
            <md-icon-button aria-label="关闭" onClick={onClose}>
              {/* @ts-ignore */}
              <md-icon>close</md-icon>
            </md-icon-button>
          ) : undefined
        }
        maxWidth="880px"
        isLoading={isPreviewLoading || isCommitLoading || isDownloadingTemplate}
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
                className="flex flex-col gap-5 pt-1 pb-0"
              >
                {/* Category Type Selector */}
                <div className="flex flex-col gap-2">
                  <span className="text-[13px] font-semibold text-[var(--md-sys-color-on-surface)]">
                    选择导入字典分类
                  </span>
                  <div className="w-full overflow-x-auto overflow-y-hidden no-scrollbar py-1 flex items-center">
                    <md-chip-set
                      ref={chipSetRef}
                      aria-label="导入字典分类选择"
                      className="flex flex-nowrap shrink-0 items-center"
                      style={{ display: 'inline-flex', flexWrap: 'nowrap', alignItems: 'center' }}
                    >
                      {REFERENCE_CATEGORIES.map((cat) => {
                        const isSelected = category === cat.key;
                        return (
                          <md-filter-chip
                            key={cat.key}
                            data-category-key={cat.key}
                            label={cat.title}
                            selected={isSelected}
                            onClick={(e: React.MouseEvent<HTMLElement>) => handleCategoryChipClick(cat.key, e)}
                            className="shrink-0"
                            has-icon
                          >
                            <md-icon slot="icon">{cat.icon}</md-icon>
                          </md-filter-chip>
                        );
                      })}
                    </md-chip-set>
                  </div>
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
                  <div className="w-12 h-12 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                  </div>
                  <span className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)] mb-1">
                    点击选择或将 CSV 文件拖拽至此处
                  </span>
                  <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">
                    支持 UTF-8 (含BOM) 及 GBK 编码格式，适用于「{currentMeta.title}」数据导入
                  </span>
                </div>

                {/* Format Rules */}
                <div className="bg-[var(--md-sys-color-surface-container)] p-3.5 rounded-2xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-primary)] shrink-0 mt-0.5">
                    info
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] leading-4">
                      {currentMeta.title}导入说明
                    </div>
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mt-1">
                      {category === 'MAJOR'
                        ? '必须包含「专业名称」和「所属学院」两列。所属学院名称必须与系统中已存在的学院名称完全一致。'
                        : category === 'HOSPITAL_DEPARTMENT'
                        ? '必须包含「科室名称」和「所属医院」两列。所属医院名称必须与系统中已存在的医院名称完全一致。'
                        : category === 'HOSPITAL'
                        ? '包含「医院名称」、「医院地址」、「联系电话」三列，医院名称为必填项。'
                        : `包含「${currentMeta.singularTitle}名称」单列即可快速批量建立数据。`}
                    </p>
                  </div>
                </div>

                {/* Template download banner */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[22px] text-[var(--md-sys-color-primary)] shrink-0">
                      description
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">
                        下载「{currentMeta.title}」官方标准 CSV 模板
                      </span>
                      <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">
                        包含标准中文表头及示例数据，开箱即用，支持 Excel / WPS 直接编辑
                      </span>
                    </div>
                  </div>
                  <OutlinedButton
                    icon="download"
                    label="下载模板"
                    onClick={() => downloadTemplate(category)}
                    noCollapse
                  />
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
                  <div className="flex flex-col p-3 rounded-2xl bg-[var(--md-sys-color-surface-container)]">
                    <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] font-medium">总读取记录</span>
                    <span className="text-[22px] font-bold text-[var(--md-sys-color-on-surface)] mt-0.5">
                      {previewData.totalRows}
                    </span>
                  </div>
                  <div className="flex flex-col p-3 rounded-2xl bg-[#dcfce7] dark:bg-[#14532d]">
                    <span className="text-[12px] text-[#15803d] dark:text-[#86efac] font-medium">待导入 (就绪)</span>
                    <span className="text-[22px] font-bold text-[#15803d] dark:text-[#86efac] mt-0.5">
                      {previewData.readyCount}
                    </span>
                  </div>
                  <div className="flex flex-col p-3 rounded-2xl bg-[#fef3c7] dark:bg-[#78350f]">
                    <span className="text-[12px] text-[#b45309] dark:text-[#fde68a] font-medium">已存在 (重复)</span>
                    <span className="text-[22px] font-bold text-[#b45309] dark:text-[#fde68a] mt-0.5">
                      {previewData.duplicateCount}
                    </span>
                  </div>
                  <div className="flex flex-col p-3 rounded-2xl bg-[#fee2e2] dark:bg-[#7f1d1d]">
                    <span className="text-[12px] text-[#b91c1c] dark:text-[#fca5a5] font-medium">格式异常 (不可导入)</span>
                    <span className="text-[22px] font-bold text-[#b91c1c] dark:text-[#fca5a5] mt-0.5">
                      {previewData.invalidCount}
                    </span>
                  </div>
                </div>

                {/* Filter Row & Overwrite Duplicate Checkbox */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {(
                      [
                        { key: 'ALL', label: `全部 (${previewData.totalRows})` },
                        { key: 'READY', label: `就绪 (${previewData.readyCount})` },
                        { key: 'DUPLICATE', label: `已存在 (${previewData.duplicateCount})` },
                        { key: 'INVALID', label: `异常 (${previewData.invalidCount})` },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setFilterStatus(tab.key)}
                        className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
                          filterStatus === tab.key
                            ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-semibold'
                            : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {previewData.duplicateCount > 0 && (
                    <label
                      className="flex items-center gap-2 cursor-pointer select-none px-2 py-1 rounded-xl transition-colors hover:bg-[var(--md-sys-color-surface-container-high)]"
                      onClick={(e) => {
                        e.preventDefault();
                        setOverwriteDuplicates(!overwriteDuplicates);
                      }}
                    >
                      <span className="text-[13px] font-medium text-[var(--md-sys-color-on-surface)]">
                        更新已存在记录
                      </span>
                      {/* @ts-ignore */}
                      <md-checkbox checked={overwriteDuplicates || undefined} />
                    </label>
                  )}
                </div>

                {/* Preview Table */}
                <EssentialBulkImportPreviewTable category={category} rows={filteredRows} />

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <OutlinedButton
                    icon="arrow_back"
                    label="重新上传"
                    onClick={() => {
                      setDirection(-1);
                      setStep('UPLOAD');
                    }}
                    noCollapse
                  />
                  <div className="flex items-center gap-3">
                    <TertiaryButton label="取消" onClick={handleCloseAttempt} noCollapse />
                    <PrimaryButton
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
                  <span className="material-symbols-outlined text-[36px]">check_circle</span>
                </div>

                <div className="flex flex-col items-center text-center">
                  <h3 className="text-[20px] font-bold text-[var(--md-sys-color-on-surface)]">
                    {currentMeta.title}批量导入完成
                  </h3>
                  <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
                    总共处理 {commitData.totalProcessed} 条数据，相关系统视图与下拉选项已实时更新。
                  </p>
                </div>

                {/* Result KPI Metrics Grid */}
                <div className="grid grid-cols-4 gap-3 w-full">
                  <div className="flex flex-col items-center p-4 rounded-2xl bg-[#dcfce7] dark:bg-[#14532d] border border-[#86efac] dark:border-[#166534]">
                    <span className="text-[12px] text-[#15803d] dark:text-[#86efac] font-medium">成功导入 (新增)</span>
                    <span className="text-[26px] font-bold text-[#15803d] dark:text-[#86efac] mt-1">
                      {commitData.importedCount}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-2xl bg-[#eff6ff] dark:bg-[#1e3a8a] border border-[#bfdbfe] dark:border-[#1d4ed8]">
                    <span className="text-[12px] text-[#1d4ed8] dark:text-[#93c5fd] font-medium">成功更新 (覆盖)</span>
                    <span className="text-[26px] font-bold text-[#1d4ed8] dark:text-[#93c5fd] mt-1">
                      {commitData.updatedCount}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-2xl bg-[#fef3c7] dark:bg-[#78350f] border border-[#fde68a] dark:border-[#92400e]">
                    <span className="text-[12px] text-[#b45309] dark:text-[#fde68a] font-medium">跳过记录</span>
                    <span className="text-[26px] font-bold text-[#b45309] dark:text-[#fde68a] mt-1">
                      {commitData.skippedCount}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-2xl bg-[#fee2e2] dark:bg-[#7f1d1d] border border-[#fca5a5] dark:border-[#991b1b]">
                    <span className="text-[12px] text-[#b91c1c] dark:text-[#fca5a5] font-medium">异常失败</span>
                    <span className="text-[26px] font-bold text-[#b91c1c] dark:text-[#fca5a5] mt-1">
                      {commitData.failedRows.length}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end w-full pt-4 border-t border-[var(--md-sys-color-outline-variant)] border-opacity-40">
                  <PrimaryButton label="完成" icon="check" onClick={onClose} noCollapse />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GenericDialog>

      {/* Discard Warning Confirmation Dialog */}
      <GenericDialog
        open={isDiscardWarningOpen}
        onClose={() => setIsDiscardWarningOpen(false)}
        title="确认放弃当前导入？"
        maxWidth="460px"
        actions={
          <>
            <OutlinedButton label="继续导入" onClick={() => setIsDiscardWarningOpen(false)} />
            <PrimaryButton
              label="确认放弃"
              onClick={() => {
                setIsDiscardWarningOpen(false);
                onClose();
              }}
            />
          </>
        }
      >
        <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
          您当前已有解析就绪的导入数据，退出后将放弃本次导入流程。是否确认退出？
        </p>
      </GenericDialog>
    </>
  );
}
