import re
import sys
import glob

files = [
    "frontend/src/pages/HeadCouncillorPage.tsx",
    "frontend/src/pages/TrialAdminPage.tsx",
    "frontend/src/pages/DoctorPage.tsx",
    "frontend/src/pages/AdminPage.tsx"
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # Add imports
    if "mapActivityTypeToUI" not in content:
        import_stmt = "import { useDashboardActivity } from '../hooks/useDashboardActivity';\nimport { mapActivityTypeToUI } from '../utils/activityMapper';\n"
        # Find the last import
        last_import = content.rfind("import ")
        end_of_last_import = content.find("\n", last_import) + 1
        content = content[:end_of_last_import] + import_stmt + content[end_of_last_import:]

    # Add hook
    if "const { data: activityData } = useDashboardActivity();" not in content:
        hook_stmt = "  const { data: activityData } = useDashboardActivity();\n"
        content = content.replace("  const { openCreation, closeCreation, expandToFullscreen } = useCreationOverlay();", 
                                  "  const { openCreation, closeCreation, expandToFullscreen } = useCreationOverlay();\n" + hook_stmt)
        # If the file doesn't have useCreationOverlay, find useAuth
        if "useCreationOverlay();" not in content:
            content = content.replace("  const { session } = useAuth();", 
                                      "  const { session } = useAuth();\n" + hook_stmt)

    # Replace activities
    old_activities = "activities={dashboardData.activities ?? []}"
    new_activities = """activityTitle="近期动态"\n            activities={activityData?.activities?.map(a => {\n              const ui = mapActivityTypeToUI(a);\n              return {\n                id: ui.id,\n                title: ui.title,\n                timestamp: new Date(ui.timestamp).toLocaleString(),\n                statusText: ui.statusText,\n                statusType: ui.statusType\n              };\n            }) ?? []}"""
    
    # Also replace activityTitle={dashboardData.activityTitle}
    content = re.sub(r'activityTitle=\{dashboardData\.activityTitle\}\s+activities=\{dashboardData\.activities \?\? \[\]\}', new_activities, content)
    # Some might not have activityTitle={...} if they just use default
    content = content.replace("activities={dashboardData.activities ?? []}", new_activities)

    with open(file, 'w') as f:
        f.write(content)
    print(f"Patched {file}")

