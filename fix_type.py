import sys
content = open('frontend/src/components/admin/AssessmentCatalogManagementView.tsx').read()

# Change the type of columns
content = content.replace(
  "const columns: ColumnDefinition<AssessmentCatalogItemDto>[] = [",
  "type TableItem = AssessmentCatalogItemDto & { id: string };\n  const columns: ColumnDefinition<TableItem>[] = ["
)

# Update handleOpenAssign and toggle stuff inside render if they expect item to be TableItem (they still will be TableItem which is compatible with AssessmentCatalogItemDto)

# Change the data prop passed to DataTable
content = content.replace(
  "data={catalog}",
  "data={catalog.map(c => ({ ...c, id: c.batteryCode }))}"
)

open('frontend/src/components/admin/AssessmentCatalogManagementView.tsx', 'w').write(content)
