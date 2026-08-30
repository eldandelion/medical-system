import * as React from 'react';
import {
  ReferenceCategory,
  REFERENCE_CATEGORIES,
  AnyReferenceItem,
  CollegeDto,
  AdminHospitalDto,
} from '../../types/references';
import {
  useReferencesList,
  useReactivateReference,
} from '../../hooks/useReferenceData';
import { PrimaryButton, OutlinedButton } from '../common/Buttons';
import { DataTable, ColumnDefinition } from '../common/DataTable';
import { EssentialEditDialog } from './EssentialEditDialog';
import { EssentialDeleteConfirmDialog } from './EssentialDeleteConfirmDialog';
import { EssentialBulkImportDialog } from './EssentialBulkImportDialog';

export function EssentialsManagementView() {
  const [activeCategory, setActiveCategory] = React.useState<ReferenceCategory>('COLLEGE');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [includeDeprecated, setIncludeDeprecated] = React.useState(true);
  const [parentFilterId, setParentFilterId] = React.useState<number | undefined>(undefined);

  // Dialog states
  const [isCreateOrEditOpen, setIsCreateOrEditOpen] = React.useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = React.useState<AnyReferenceItem | null>(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [selectedItemForDelete, setSelectedItemForDelete] = React.useState<AnyReferenceItem | null>(null);

  const [isImportOpen, setIsImportOpen] = React.useState(false);

  const currentMeta = REFERENCE_CATEGORIES.find((c) => c.key === activeCategory)!;

  // Reactivate mutation
  const { mutateAsync: reactivateItem } = useReactivateReference();

  // Load parent list for filtering if applicable
  const { data: colleges = [] } = useReferencesList('COLLEGE', { includeDeprecated: true });
  const { data: hospitals = [] } = useReferencesList('HOSPITAL', { includeDeprecated: true });

  const columns: ColumnDefinition<AnyReferenceItem>[] = React.useMemo(() => {
    const cols: ColumnDefinition<AnyReferenceItem>[] = [
      {
        key: 'name',
        label: `${currentMeta.singularTitle}名称`,
        width: currentMeta.hasParent ? 'w-[30%]' : 'w-[36%]',
        render: (item) => (
          <span className="font-medium text-[14px] text-[var(--md-sys-color-on-surface)]">
            {item.name}
          </span>
        ),
      },
    ];

    if (currentMeta.hasParent) {
      cols.push({
        key: 'parent',
        label: currentMeta.parentLabel || '所属上级',
        width: 'w-[22%]',
        render: (item) => {
          const parentName =
            'collegeName' in item ? item.collegeName : 'hospitalName' in item ? item.hospitalName : '-';
          return (
            <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">
              {parentName || '-'}
            </span>
          );
        },
      });
    }

    if (activeCategory === 'COLLEGE') {
      cols.push(
        {
          key: 'majorCount',
          label: '下属专业',
          width: 'w-[18%]',
          render: (item) => (
            <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">
              {'majorCount' in item ? item.majorCount : 0} 个专业
            </span>
          ),
        },
        {
          key: 'teacherCount',
          label: '教师/导师',
          width: 'w-[18%]',
          render: (item) => (
            <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">
              {'teacherCount' in item ? item.teacherCount : 0} 人
            </span>
          ),
        }
      );
    } else if (activeCategory === 'MAJOR') {
      cols.push({
        key: 'studentCount',
        label: '在籍学生',
        width: 'w-[24%]',
        render: (item) => (
          <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">
            {'studentCount' in item ? item.studentCount : 0} 人
          </span>
        ),
      });
    } else if (activeCategory === 'SCHOOL_DEPARTMENT') {
      cols.push({
        key: 'staffCount',
        label: '直属工作人员',
        width: 'w-[28%]',
        render: (item) => (
          <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">
            {'staffCount' in item ? item.staffCount : 0} 人
          </span>
        ),
      });
    } else if (activeCategory === 'HOSPITAL') {
      cols.push(
        {
          key: 'departmentCount',
          label: '开设科室',
          width: 'w-[16%]',
          render: (item) => (
            <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">
              {'departmentCount' in item ? item.departmentCount : 0} 个科室
            </span>
          ),
        },
        {
          key: 'activeReferralCount',
          label: '转诊记录',
          width: 'w-[16%]',
          render: (item) => (
            <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">
              {'activeReferralCount' in item ? item.activeReferralCount : 0} 条
            </span>
          ),
        },
        {
          key: 'contact',
          label: '联系方式',
          width: 'w-[22%]',
          render: (item) => (
            <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">
              {('contactPhone' in item ? item.contactPhone : '') || ('address' in item ? item.address : '') || '-'}
            </span>
          ),
        }
      );
    } else if (activeCategory === 'HOSPITAL_DEPARTMENT') {
      cols.push({
        key: 'doctorCount',
        label: '专科医生',
        width: 'w-[24%]',
        render: (item) => (
          <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">
            {'doctorCount' in item ? item.doctorCount : 0} 人
          </span>
        ),
      });
    } else if (activeCategory === 'ETHNICITY' || activeCategory === 'DEGREE_LEVEL') {
      cols.push({
        key: 'studentCount',
        label: '关联学生档案',
        width: 'w-[28%]',
        render: (item) => (
          <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">
            {'studentCount' in item ? item.studentCount : 0} 人
          </span>
        ),
      });
    }

    cols.push(
      {
        key: 'status',
        label: '状态',
        width: 'w-28',
        render: (item) =>
          item.status === 'ACTIVE' ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#dcfce7] text-[#15803d] dark:bg-[#14532d] dark:text-[#86efac]">
              正常可用
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#fef3c7] text-[#b45309] dark:bg-[#78350f] dark:text-[#fde68a]">
              已停用
            </span>
          ),
      },
      {
        key: 'actions',
        label: '操作',
        width: 'w-36',
        overflowVisible: true,
        render: (item) => (
          <div
            className="flex items-center justify-start -ml-2"
            onClick={(e) => e.stopPropagation()}
          >
            <md-icon-button
              aria-label="编辑"
              title="编辑"
              onClick={() => handleOpenEdit(item)}
            >
              <md-icon>edit</md-icon>
            </md-icon-button>

            {item.status === 'DEPRECATED' && (
              <md-icon-button
                aria-label="重新启用"
                title="重新启用"
                onClick={() => handleReactivate(item)}
              >
                <md-icon>restore</md-icon>
              </md-icon-button>
            )}

            <md-icon-button
              aria-label={item.status === 'DEPRECATED' ? '彻底删除' : '停用 / 删除'}
              title={item.status === 'DEPRECATED' ? '彻底删除' : '停用 / 删除'}
              onClick={() => handleOpenDelete(item)}
            >
              <md-icon>delete</md-icon>
            </md-icon-button>
          </div>
        ),
      }
    );

    return cols;
  }, [activeCategory, currentMeta]);

  // Main data list
  const {
    data: items = [],
    isLoading,
    isError,
    refetch,
  } = useReferencesList(activeCategory, {
    query: searchQuery,
    collegeId: activeCategory === 'MAJOR' ? parentFilterId : undefined,
    hospitalId: activeCategory === 'HOSPITAL_DEPARTMENT' ? parentFilterId : undefined,
    includeDeprecated,
  });

  // Reset parent filter and search on category switch
  const handleCategoryChange = (newCat: ReferenceCategory) => {
    setActiveCategory(newCat);
    setSearchQuery('');
    setParentFilterId(undefined);
  };

  const handleOpenCreate = () => {
    setSelectedItemForEdit(null);
    setIsCreateOrEditOpen(true);
  };

  const handleOpenEdit = (item: AnyReferenceItem) => {
    setSelectedItemForEdit(item);
    setIsCreateOrEditOpen(true);
  };

  const handleOpenDelete = (item: AnyReferenceItem) => {
    setSelectedItemForDelete(item);
    setIsDeleteConfirmOpen(true);
  };

  const handleReactivate = async (item: AnyReferenceItem) => {
    await reactivateItem({ category: activeCategory, id: item.id });
  };

  const chipSetRef = React.useRef<HTMLElement>(null);

  const handleCategoryChipClick = (catKey: ReferenceCategory, e: React.MouseEvent<HTMLElement>) => {
    if (activeCategory === catKey) {
      e.preventDefault();
      (e.currentTarget as any).selected = true;
      return;
    }
    handleCategoryChange(catKey);
  };

  React.useEffect(() => {
    if (!chipSetRef.current) return;
    const chips = chipSetRef.current.querySelectorAll('md-filter-chip');
    chips.forEach((chip: any) => {
      const catKey = chip.dataset.categoryKey as ReferenceCategory;
      const shouldBeSelected = activeCategory === catKey;
      if (chip.selected !== shouldBeSelected) {
        chip.selected = shouldBeSelected;
      }
    });
  }, [activeCategory]);

  return (
    <div className="w-full h-full flex flex-col pt-4 overflow-hidden relative">
      {/* Top Filter Chips and Action Bar (Positioned directly under title) */}
      <div className="shrink-0 z-30 bg-[var(--md-sys-color-surface)] pb-2 -mt-4 pt-4 px-6 mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        {/* Material Design 3 Filter Chips with Horizontal Scroll */}
        <div className="w-full lg:flex-1 min-w-0 overflow-x-auto overflow-y-hidden no-scrollbar py-1 flex items-center">
          <md-chip-set
            ref={chipSetRef}
            aria-label="基础字典分类筛选"
            className="flex flex-nowrap shrink-0 items-center"
            style={{ display: 'inline-flex', flexWrap: 'nowrap', alignItems: 'center' }}
          >
            {REFERENCE_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.key;
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

        {/* Header Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <OutlinedButton
            icon="upload_file"
            label="批量导入"
            onClick={() => setIsImportOpen(true)}
            noCollapse
          />
          <PrimaryButton
            icon="add"
            label={`新增${currentMeta.singularTitle}`}
            onClick={handleOpenCreate}
            noCollapse
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="shrink-0 px-6 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[var(--md-sys-color-on-surface-variant)] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`搜索${currentMeta.singularTitle}名称...`}
              className="w-full h-9 pl-10 pr-4 rounded-full text-xs bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-outline)] border border-transparent focus:border-[var(--md-sys-color-primary)] focus:bg-[var(--md-sys-color-surface)] focus:outline-none transition-all"
            />
          </div>

          {/* Parent Filter for Major */}
          {activeCategory === 'MAJOR' && (
            <div className="min-w-[180px]">
              <md-outlined-select
                label="所属学院"
                className="w-full"
                value={parentFilterId !== undefined ? String(parentFilterId) : ''}
                onChange={(e: React.SyntheticEvent) => {
                  const target = e.target as HTMLSelectElement;
                  setParentFilterId(target.value ? Number(target.value) : undefined);
                }}
              >
                <md-select-option value="">
                  <div slot="headline">全部学院</div>
                </md-select-option>
                {(colleges as CollegeDto[]).map((c) => (
                  <md-select-option key={c.id} value={String(c.id)}>
                    <div slot="headline">{c.name}</div>
                  </md-select-option>
                ))}
              </md-outlined-select>
            </div>
          )}

          {/* Parent Filter for Hospital Department */}
          {activeCategory === 'HOSPITAL_DEPARTMENT' && (
            <div className="min-w-[180px]">
              <md-outlined-select
                label="所属医院"
                className="w-full"
                value={parentFilterId !== undefined ? String(parentFilterId) : ''}
                onChange={(e: React.SyntheticEvent) => {
                  const target = e.target as HTMLSelectElement;
                  setParentFilterId(target.value ? Number(target.value) : undefined);
                }}
              >
                <md-select-option value="">
                  <div slot="headline">全部医院</div>
                </md-select-option>
                {(hospitals as AdminHospitalDto[]).map((h) => (
                  <md-select-option key={h.id} value={String(h.id)}>
                    <div slot="headline">{h.name}</div>
                  </md-select-option>
                ))}
              </md-outlined-select>
            </div>
          )}
        </div>

        {/* Include Deprecated Toggle */}
        <label
          className="flex items-center gap-2 cursor-pointer select-none text-[13px] font-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
          onClick={() => setIncludeDeprecated(!includeDeprecated)}
        >
          {/* @ts-ignore */}
          <md-checkbox checked={includeDeprecated || undefined} />
          <span>显示已停用数据</span>
        </label>
      </div>

      {/* Table Content Area - Edge to Edge */}
      <div className="flex-1 min-h-0 flex flex-col relative">
        {isLoading && items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] text-[var(--md-sys-color-on-surface-variant)]">
            {/* @ts-ignore */}
            <md-circular-progress indeterminate></md-circular-progress>
            <span className="text-[14px] mt-3">正在加载基础字典数据...</span>
          </div>
        ) : isError ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] text-[var(--md-sys-color-error)]">
            <span className="material-symbols-outlined text-4xl mb-2">error</span>
            <p className="text-sm mb-3">加载字典列表失败，请检查网络或稍后重试。</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-1.5 text-xs font-medium rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
            >
              重试
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] text-[var(--md-sys-color-on-surface-variant)] py-16">
            <span className="material-symbols-outlined text-[36px] opacity-40 mb-2">
              folder_open
            </span>
            <span className="text-[14px]">未找到匹配的{currentMeta.singularTitle}数据</span>
            {searchQuery && (
              <span className="text-[12px] opacity-70 mt-1">
                请尝试清除搜索关键词或调整上级分类筛选
              </span>
            )}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={items}
            onRowClick={handleOpenEdit}
          />
        )}
      </div>

      {/* Edit / Create Dialog */}
      <EssentialEditDialog
        open={isCreateOrEditOpen}
        category={activeCategory}
        item={selectedItemForEdit}
        onClose={() => setIsCreateOrEditOpen(false)}
      />

      {/* Delete / Deprecate Dialog */}
      <EssentialDeleteConfirmDialog
        open={isDeleteConfirmOpen}
        category={activeCategory}
        item={selectedItemForDelete}
        onClose={() => setIsDeleteConfirmOpen(false)}
      />

      {/* Bulk Import Modal */}
      <EssentialBulkImportDialog
        open={isImportOpen}
        initialCategory={activeCategory}
        onClose={() => setIsImportOpen(false)}
      />
    </div>
  );
}
