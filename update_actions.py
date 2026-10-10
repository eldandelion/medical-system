import sys

# --- 1. Update Component ---
file_path = 'frontend/src/components/admin/AssessmentCatalogManagementView.tsx'
content = open(file_path).read()

# Remove activeMenuCode state
content = content.replace("const [activeMenuCode, setActiveMenuCode] = useState<string | null>(null);\n", "")

old_action_column = """    {
      key: 'actions',
      label: '操作',
      width: 'w-[15%]',
      overflowVisible: true,
      render: (item) => {
        const isAvailable = item.isEnabled !== false;
        const anchorId = `scale-menu-${item.batteryCode.replace(/[^a-zA-Z0-9_-]/g, '')}`;
        return (
          <div className="flex items-center justify-end gap-1 pr-2" onClick={(e) => e.stopPropagation()}>
            <md-icon-button
              aria-label="指派测评"
              title="指派测评"
              disabled={!isAvailable}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleOpenAssign(item);
              }}
            >
              <md-icon>assignment_add</md-icon>
            </md-icon-button>
            <div className="relative shrink-0 flex items-center justify-center">
              <md-icon-button
                id={anchorId}
                className="scale-90 text-[var(--md-sys-color-on-surface-variant)] cursor-pointer"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setActiveMenuCode(activeMenuCode === item.batteryCode ? null : item.batteryCode);
                }}
              >
                <md-icon>more_horiz</md-icon>
              </md-icon-button>

              <md-menu
                anchor={anchorId}
                open={activeMenuCode === item.batteryCode}
                onClosed={() => {
                  if (activeMenuCode === item.batteryCode) setActiveMenuCode(null);
                }}
                quick
                style={{
                  minWidth: '150px',
                  '--md-menu-item-focus-outline-width': '0',
                  '--md-menu-item-selected-outline-width': '0',
                  zIndex: 100,
                } as React.CSSProperties}
              >
                {isAvailable ? (
                  <md-menu-item
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuCode(null);
                      setPendingHideScale(item);
                    }}
                  >
                    <md-icon slot="start">visibility_off</md-icon>
                    <div slot="headline">隐藏量表</div>
                  </md-menu-item>
                ) : (
                  <md-menu-item
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuCode(null);
                      handleToggle(item, true);
                    }}
                  >
                    <md-icon slot="start">visibility</md-icon>
                    <div slot="headline">启用上线</div>
                  </md-menu-item>
                )}
              </md-menu>
            </div>
          </div>
        );
      }
    }"""

new_action_column = """    {
      key: 'actions',
      label: '',
      width: 'w-[15%]',
      overflowVisible: true,
      render: (item) => {
        const isAvailable = item.isEnabled !== false;
        return (
          <div className="flex items-center justify-end gap-1 pr-2" onClick={(e) => e.stopPropagation()}>
            <md-icon-button
              aria-label="指派测评"
              title="指派测评"
              disabled={!isAvailable}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleOpenAssign(item);
              }}
            >
              <md-icon>assignment_add</md-icon>
            </md-icon-button>
            {isAvailable ? (
              <md-icon-button
                aria-label="隐藏量表"
                title="隐藏量表"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setPendingHideScale(item);
                }}
              >
                <md-icon>visibility_off</md-icon>
              </md-icon-button>
            ) : (
              <md-icon-button
                aria-label="启用上线"
                title="启用上线"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleToggle(item, true);
                }}
              >
                <md-icon>visibility</md-icon>
              </md-icon-button>
            )}
          </div>
        );
      }
    }"""

content = content.replace(old_action_column, new_action_column)
open(file_path, 'w').write(content)

# --- 2. Update Tests ---
test_path = 'frontend/src/components/admin/AssessmentCatalogManagementView.test.tsx'
test_content = open(test_path).read()

old_hide_test = """  it('opens md-menu and triggers confirmation dialog when clicking 隐藏量表 on available scale', () => {
    render(<AssessmentCatalogManagementView />);

    const moreButtons = document.querySelectorAll('md-icon-button');
    // First more button belongs to PHQ-9 (available)
    const phq9MoreBtn = moreButtons[0];
    fireEvent.click(phq9MoreBtn);

    // Menu item is displayed
    const hideMenuItem = screen.getByText('隐藏量表');
    expect(hideMenuItem).toBeDefined();
    fireEvent.click(hideMenuItem);"""

new_hide_test = """  it('triggers confirmation dialog when clicking 隐藏量表 icon on available scale', () => {
    render(<AssessmentCatalogManagementView />);

    const hideBtns = document.querySelectorAll('md-icon-button[aria-label="隐藏量表"]');
    const phq9HideBtn = hideBtns[0];
    fireEvent.click(phq9HideBtn);"""

test_content = test_content.replace(old_hide_test, new_hide_test)

old_hide_action_test = """  it('executes hide scale action when confirmed in dialog', async () => {
    render(<AssessmentCatalogManagementView />);

    const moreButtons = document.querySelectorAll('md-icon-button');
    const phq9MoreBtn = moreButtons[0];
    fireEvent.click(phq9MoreBtn);

    const hideMenuItem = screen.getByText('隐藏量表');
    fireEvent.click(hideMenuItem);"""

new_hide_action_test = """  it('executes hide scale action when confirmed in dialog', async () => {
    render(<AssessmentCatalogManagementView />);

    const hideBtns = document.querySelectorAll('md-icon-button[aria-label="隐藏量表"]');
    const phq9HideBtn = hideBtns[0];
    fireEvent.click(phq9HideBtn);"""

test_content = test_content.replace(old_hide_action_test, new_hide_action_test)

old_enable_test = """  it('opens md-menu and directly enables scale when clicking 启用上线 on hidden scale', () => {
    render(<AssessmentCatalogManagementView />);

    const moreButtons = document.querySelectorAll('md-icon-button');
    // Second more button belongs to GAD-7 (hidden)
    const gad7MoreBtn = moreButtons[1];
    fireEvent.click(gad7MoreBtn);

    const enableMenuItem = screen.getByText('启用上线');
    expect(enableMenuItem).toBeDefined();
    fireEvent.click(enableMenuItem);"""

new_enable_test = """  it('directly enables scale when clicking 启用上线 icon on hidden scale', () => {
    render(<AssessmentCatalogManagementView />);

    const enableBtns = document.querySelectorAll('md-icon-button[aria-label="启用上线"]');
    const gad7EnableBtn = enableBtns[0];
    fireEvent.click(gad7EnableBtn);"""

test_content = test_content.replace(old_enable_test, new_enable_test)

open(test_path, 'w').write(test_content)

