import * as React from 'react';
import { StudentImportRow, StudentImportFieldError } from '../../types/studentImport';

interface StudentBulkImportPreviewTableProps {
  rows: StudentImportRow[];
}

const FIELD_LABELS: Record<string, string> = {
  studentNumber: '学号',
  name: '姓名',
  major: '专业',
  enrollmentDate: '入学日期',
  idCardNumber: '身份证号',
  gender: '性别',
  ethnicity: '民族',
  contactNumber: '联系电话',
  email: '电子邮箱',
  homeAddress: '家庭住址',
  emergencyContactName: '紧急联系人',
  emergencyContactPhone: '紧急联系电话',
  teacherEmployeeNumber: '导师工号'
};

export function formatImportError(err: StudentImportFieldError): string {
  const fieldName = FIELD_LABELS[err.field] || err.field;
  switch (err.code) {
    case 'REQUIRED_FIELD_MISSING':
      return `${fieldName}为必填项`;
    case 'MAJOR_NOT_FOUND':
      return `专业在系统中未匹配: "${err.invalidValue ?? ''}"`;
    case 'TEACHER_NOT_FOUND':
      return `工号未找到对应导师: "${err.invalidValue ?? ''}"`;
    case 'ETHNICITY_NOT_FOUND':
      return `民族名称未匹配: "${err.invalidValue ?? ''}"`;
    case 'DUPLICATE_IN_DATABASE':
      return '学号已在系统中存在';
    case 'INTRA_FILE_DUPLICATE':
      return `CSV内部学号重复 (${err.invalidValue ?? ''})`;
    case 'INVALID_ID_CARD_FORMAT':
      return `身份证号格式无效 (需18位标准格式)`;
    case 'INVALID_PHONE_FORMAT':
      return `${fieldName}格式无效 (需11位手机号)`;
    case 'INVALID_EMAIL_FORMAT':
      return `邮箱格式无效`;
    case 'INVALID_DATE_FORMAT':
      return `日期格式无效 (支持 yyyy-MM-dd / yyyy-MM)`;
    case 'FUTURE_DATE':
      return `日期格式异常`;
    default:
      return `${fieldName}校验未通过`;
  }
}

const PAGE_CHUNK_SIZE = 25;

export function StudentBulkImportPreviewTable({ rows }: StudentBulkImportPreviewTableProps) {
  const [visibleCount, setVisibleCount] = React.useState(PAGE_CHUNK_SIZE);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Reset pagination count when rows change (e.g. filter changes)
  React.useEffect(() => {
    setVisibleCount(PAGE_CHUNK_SIZE);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [rows]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 80) {
      setVisibleCount((prev) => Math.min(prev + PAGE_CHUNK_SIZE, rows.length));
    }
  };

  const visibleRows = React.useMemo(() => {
    return rows.slice(0, visibleCount);
  }, [rows, visibleCount]);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[var(--md-sys-color-on-surface-variant)] text-[14px]">
        {/* @ts-ignore */}
        <md-icon className="text-[36px] mb-2 text-[var(--md-sys-color-outline)]">inbox</md-icon>
        <span>当前筛选条件下暂无数据</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="w-full border border-[var(--md-sys-color-outline-variant)] rounded-xl overflow-x-auto overflow-y-auto max-h-[380px] custom-scrollbar bg-[var(--md-sys-color-surface-container-low)]"
    >
      <table className="w-full text-left text-[13px] border-collapse min-w-[760px]">
        <thead className="sticky top-0 z-10 bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] text-[12px] font-medium tracking-[0.5px] border-b border-[var(--md-sys-color-outline-variant)]">
          <tr>
            <th className="py-2.5 px-3 w-[50px] text-center">#</th>
            <th className="py-2.5 px-3 w-[110px]">学号</th>
            <th className="py-2.5 px-3 w-[90px]">姓名</th>
            <th className="py-2.5 px-3 w-[120px]">专业</th>
            <th className="py-2.5 px-3 w-[100px]">入学日期</th>
            <th className="py-2.5 px-3 w-[160px]">身份证号</th>
            <th className="py-2.5 px-3 w-[100px]">导师工号</th>
            <th className="py-2.5 px-3 min-w-[180px]">状态与提示</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)] divide-opacity-30">
          {visibleRows.map((row) => (
            <tr
              key={`${row.rowNumber}-${row.studentNumber}`}
              className="transition-colors hover:bg-[var(--md-sys-color-surface-container-high)]"
            >
                <td className="py-2.5 px-3 text-center text-[12px] text-[var(--md-sys-color-on-surface-variant)]">
                  {row.rowNumber}
                </td>
                <td className="py-2.5 px-3 font-medium text-[var(--md-sys-color-on-surface)]">
                  {row.studentNumber || <span className="text-[var(--md-sys-color-error)] italic">缺失</span>}
                </td>
                <td className="py-2.5 px-3 text-[var(--md-sys-color-on-surface)]">
                  {row.name || <span className="text-[var(--md-sys-color-error)] italic">缺失</span>}
                </td>
                <td className="py-2.5 px-3 text-[var(--md-sys-color-on-surface-variant)] truncate max-w-[120px]" title={row.major}>
                  {row.major || <span className="text-[var(--md-sys-color-error)] italic">缺失</span>}
                </td>
                <td className="py-2.5 px-3 text-[var(--md-sys-color-on-surface-variant)]">
                  {row.enrollmentDate || '-'}
                </td>
                <td className="py-2.5 px-3 text-[var(--md-sys-color-on-surface-variant)] font-mono text-[12px]">
                  {row.idCardNumber || '-'}
                </td>
                <td className="py-2.5 px-3 text-[var(--md-sys-color-on-surface-variant)] font-mono text-[12px]">
                  {row.teacherEmployeeNumber || '-'}
                </td>
                <td className="py-2.5 px-3">
                  {row.status === 'READY' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#dcfce7] text-[#15803d] dark:bg-[#14532d] dark:text-[#86efac]">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                      待导入
                    </span>
                  )}
                  {row.status === 'DUPLICATE' && (
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#fef3c7] text-[#b45309] dark:bg-[#78350f] dark:text-[#fde68a] w-fit">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
                        已存在 (重复)
                      </span>
                    </div>
                  )}
                  {row.status === 'INVALID' && (
                    <div className="flex flex-col gap-1 py-0.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#fee2e2] text-[#b91c1c] dark:bg-[#7f1d1d] dark:text-[#fca5a5] w-fit">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                        格式异常 ({row.errors.length})
                      </span>
                      <div className="text-[11px] text-[var(--md-sys-color-error)] space-y-0.5">
                        {row.errors.map((err, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <span>•</span>
                            <span>{formatImportError(err)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {visibleCount < rows.length && (
        <div className="py-2.5 text-center text-[12px] text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container)] border-t border-[var(--md-sys-color-outline-variant)]">
          已加载 {visibleCount} / {rows.length} 条，继续向下滚动查看更多...
        </div>
      )}
    </div>
  );
}
