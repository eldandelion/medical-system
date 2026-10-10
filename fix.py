import sys
content = open('frontend/src/components/admin/AssessmentCatalogManagementView.tsx').read()
content = content.replace(
"""            <PrimaryButton
              label="确认隐藏"
              style={{
                color: 'var(--md-sys-color-error)',""",
"""            <TertiaryButton
              label="确认隐藏"
              style={{
                color: 'var(--md-sys-color-error)',"""
)
open('frontend/src/components/admin/AssessmentCatalogManagementView.tsx', 'w').write(content)
