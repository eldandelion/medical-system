import os
import re

test_dir = 'src/test/kotlin/com/medicalsystem/backend'

imports_to_remove = [
    'com.medicalsystem.backend.model.StudentUser',
    'com.medicalsystem.backend.model.Teacher',
    'com.medicalsystem.backend.model.Doctor',
    'com.medicalsystem.backend.model.TrialAdmin',
    'com.medicalsystem.backend.model.HeadCounsellor',
    'com.medicalsystem.backend.model.SystemAdmin'
]

for root, _, files in os.walk(test_dir):
    for file in files:
        if file.endswith('.kt'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                lines = f.readlines()

            original_lines = list(lines)

            # Filter out lines that match the imports
            lines = [line for line in lines if not any(f'import {imp}' in line for imp in imports_to_remove)]

            if lines != original_lines:
                with open(filepath, 'w') as f:
                    f.writelines(lines)
                print(f"Removed imports from {filepath}")
