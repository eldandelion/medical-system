import * as React from 'react';
import { ReferenceCategory, ReferenceImportRowDto, REFERENCE_CATEGORIES } from '../../types/references';

interface EssentialBulkImportPreviewTableProps {
  category: ReferenceCategory;
  rows: ReferenceImportRowDto[];
}

export function EssentialBulkImportPreviewTable({
  category,
  rows,
}: EssentialBulkImportPreviewTableProps) {
  const meta = REFERENCE_CATEGORIES.find((c) => c.key === category)!;

  const renderStatusBadge = (status: string, errorCode?: string | null) => {
    switch (status) {
      case 'READY':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium bg-[#dcfce7] text-[#15803d] dark:bg-[#14532d] dark:text-[#86efac]">
            就绪 (待导入)
          </span>
        );
      case 'DUPLICATE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium bg-[#fef3c7] text-[#b45309] dark:bg-[#78350f] dark:text-[#fde68a]">
            已存在 (重复)
          </span>
        );
      case 'INVALID':
      default:
        return (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium bg-[#fee2e2] text-[#b91c1c] dark:bg-[#7f1d1d] dark:text-[#fca5a5]"
            title={errorCode || '格式异常'}
          >
            异常 ({errorCode || '校验失败'})
          </span>
        );
    }
  };

  if (rows.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center rounded-2xl border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)] text-[14px]">
        暂无符合筛选条件的预览记录
      </div>
    );
  }

  return (
    <div className="w-full max-h-[340px] overflow-auto rounded-2xl border border-[var(--md-sys-color-outline-variant)] border-opacity-60 bg-[var(--md-sys-color-surface-container-lowest)] custom-scrollbar">
      <table className="w-full text-left border-collapse text-[13px]">
        <thead className="sticky top-0 bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] text-[12px] font-semibold tracking-wider z-10 border-b border-[var(--md-sys-color-outline-variant)] border-opacity-40">
          <tr>
            <th className="py-2.5 px-3 w-14 text-center">行号</th>
            <th className="py-2.5 px-3 w-28">状态</th>
            <th className="py-2.5 px-3">{meta.singularTitle}名称</th>
            {meta.hasParent && <th className="py-2.5 px-3">{meta.parentLabel}</th>}
            {category === 'HOSPITAL' && (
              <>
                <th className="py-2.5 px-3">医院地址</th>
                <th className="py-2.5 px-3">联系电话</th>
              </>
            )}
            <th className="py-2.5 px-3">异常说明</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)] divide-opacity-30">
          {rows.map((row) => (
            <tr
              key={row.rowNumber}
              className="hover:bg-[var(--md-sys-color-surface-container-low)] transition-colors"
            >
              <td className="py-2 px-3 text-center text-[var(--md-sys-color-on-surface-variant)]">
                {row.rowNumber}
              </td>
              <td className="py-2 px-3">{renderStatusBadge(row.status, row.errorCode)}</td>
              <td className="py-2 px-3 font-medium text-[var(--md-sys-color-on-surface)]">
                {row.name || <span className="text-[var(--md-sys-color-error)]">（未填写）</span>}
              </td>
              {meta.hasParent && (
                <td className="py-2 px-3 text-[var(--md-sys-color-on-surface)]">
                  {row.parentName || (
                    <span className="text-[var(--md-sys-color-error)]">（未填写）</span>
                  )}
                </td>
              )}
              {category === 'HOSPITAL' && (
                <>
                  <td className="py-2 px-3 text-[var(--md-sys-color-on-surface-variant)]">
                    {row.address || '-'}
                  </td>
                  <td className="py-2 px-3 text-[var(--md-sys-color-on-surface-variant)]">
                    {row.contactPhone || '-'}
                  </td>
                </>
              )}
              <td className="py-2 px-3 text-[12px] text-[var(--md-sys-color-error)]">
                {row.errorCode ? (
                  row.errorCode === 'NAME_REQUIRED' ? '名称不能为空' :
                  row.errorCode === 'PARENT_REQUIRED' ? '所属上级不能为空' :
                  row.errorCode === 'PARENT_NOT_FOUND' ? '未找到对应上级记录' :
                  row.errorCode
                ) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
