import sys

content = open('frontend/src/components/admin/AssessmentCatalogManagementView.test.tsx').read()

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
});
"""

# replace the last `});` with missing_tests
content = content.rsplit('});', 1)[0] + missing_tests

# Fix the test checking for text '指派测评' since it's an aria-label now.
content = content.replace(
    "expect(screen.getAllByText('指派测评').length).toBe(2);",
    "expect(document.querySelectorAll('md-icon-button[aria-label=\"指派测评\"]').length).toBe(2);"
)
content = content.replace(
    "const assignBtns = screen.getAllByText('指派测评');",
    "const assignBtns = document.querySelectorAll('md-icon-button[aria-label=\"指派测评\"]');"
)
# And the test name:
content = content.replace("clicking 指派测评 on", "clicking 指派测评 icon on")

open('frontend/src/components/admin/AssessmentCatalogManagementView.test.tsx', 'w').write(content)
