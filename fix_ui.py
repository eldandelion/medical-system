import sys

# 1. Fix AssessmentCatalogManagementView.tsx
content = open('frontend/src/components/admin/AssessmentCatalogManagementView.tsx').read()

# Add SegmentedButton to imports if missing
if "SegmentedButton" not in content:
    content = content.replace(
        "import { PrimaryButton, TertiaryButton, OutlinedButton } from '../common/Buttons';",
        "import { PrimaryButton, TertiaryButton, OutlinedButton, SegmentedButton } from '../common/Buttons';"
    )

# Add CATALOG_VIEW_SEGMENTS and activeTab state
if "export const CATALOG_VIEW_SEGMENTS" not in content:
    insert_before = "export const AssessmentCatalogManagementView: React.FC = () => {"
    insert_code = """export const CATALOG_VIEW_SEGMENTS = [
  { label: '量表列表', value: 'catalog' },
  { label: '指派历史', value: 'history' },
];

"""
    content = content.replace(insert_before, insert_code + insert_before)

if "const [activeTab, setActiveTab]" not in content:
    content = content.replace(
        "const { catalog, isLoading, isError, refetch",
        "const [activeTab, setActiveTab] = useState<string>('catalog');\n  const { catalog, isLoading, isError, refetch"
    )

# Replace the OutlinedButton for assign with md-icon-button
old_action_btn = """            <OutlinedButton 
              label="指派测评"
              disabled={!isAvailable}
              onClick={() => handleOpenAssign(item)}
              className="h-8 !px-2.5 text-xs"
              noCollapse
            />"""

new_action_btn = """            <md-icon-button
              aria-label="指派测评"
              title="指派测评"
              disabled={!isAvailable}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleOpenAssign(item);
              }}
            >
              <md-icon>assignment_add</md-icon>
            </md-icon-button>"""

content = content.replace(old_action_btn, new_action_btn)

# Remove minWidth="900px"
content = content.replace('minWidth="900px"', '')

# Wrap the table area with the activeTab condition and segmented button
old_return = """  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[var(--md-sys-color-surface)]">
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {isLoading ? ("""

new_return = """  return (
    <div className="w-full h-full flex flex-col pt-5 overflow-hidden relative bg-[var(--md-sys-color-surface)]">
      <div className="shrink-0 z-30 bg-[var(--md-sys-color-surface)] pb-2 -mt-5 pt-5 px-6 mb-6 flex items-center justify-start">
        <SegmentedButton
          items={CATALOG_VIEW_SEGMENTS}
          selectedValue={activeTab}
          onChange={(value) => setActiveTab(value)}
        />
      </div>

      {activeTab === 'catalog' ? (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {isLoading ? ("""

content = content.replace(old_return, new_return)

old_table_end = """            onRowClick={(item) => setViewingScale(item)}
            
          />
        )}
      </div>

      {/* Full-Screen Scale View */}"""

new_table_end = """            onRowClick={(item) => setViewingScale(item)}
          />
        )}
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-12 text-[var(--md-sys-color-on-surface-variant)]">
          <p className="text-sm">暂无指派历史</p>
        </div>
      )}

      {/* Full-Screen Scale View */}"""

content = content.replace(
"""            onRowClick={(item) => setViewingScale(item)}
            
          />
        )}
      </div>

      {/* Full-Screen Scale View */}""", new_table_end)

open('frontend/src/components/admin/AssessmentCatalogManagementView.tsx', 'w').write(content)

# 2. Fix AssessmentCatalogManagementView.test.tsx
test_content = open('frontend/src/components/admin/AssessmentCatalogManagementView.test.tsx').read()

missing_tests = """
  it('renders segmented button with text-only labels', () => {
    render(<AssessmentCatalogManagementView />);
    expect(screen.getByText('量表列表')).toBeDefined();
    expect(screen.getByText('指派历史')).toBeDefined();
  });

  it('switches between catalog table and empty history placeholder view via segmented button', () => {
    render(<AssessmentCatalogManagementView />);
    expect(screen.getByText('抑郁症筛查量表 (PHQ-9)')).toBeDefined();
    expect(screen.queryByText('暂无指派历史')).toBeNull();

    fireEvent.click(screen.getByText('指派历史'));
    expect(screen.getByText('暂无指派历史')).toBeDefined();
    expect(screen.queryByText('抑郁症筛查量表 (PHQ-9)')).toBeNull();

    fireEvent.click(screen.getByText('量表列表'));
    expect(screen.getByText('抑郁症筛查量表 (PHQ-9)')).toBeDefined();
    expect(screen.queryByText('暂无指派历史')).toBeNull();
  });
});"""

test_content = test_content.replace('});\n', missing_tests)
# Also change test: `expect(screen.getAllByText('指派测评').length).toBe(2);` is no longer valid since it's md-icon-button without text, just aria-label/title.
test_content = test_content.replace(
    "expect(screen.getAllByText('指派测评').length).toBe(2);",
    "expect(document.querySelectorAll('md-icon-button[aria-label=\"指派测评\"]').length).toBe(2);"
)

test_content = test_content.replace(
    "const assignBtns = screen.getAllByText('指派测评');",
    "const assignBtns = document.querySelectorAll('md-icon-button[aria-label=\"指派测评\"]');"
)

open('frontend/src/components/admin/AssessmentCatalogManagementView.test.tsx', 'w').write(test_content)
