import os
import re

test_dir = 'src/test/kotlin/com/medicalsystem/backend'

roles_map = {
    'StudentUser': 'com.medicalsystem.backend.model.UserRole.STUDENT',
    'Teacher': 'com.medicalsystem.backend.model.UserRole.TEACHER',
    'Doctor': 'com.medicalsystem.backend.model.UserRole.DOCTOR',
    'TrialAdmin': 'com.medicalsystem.backend.model.UserRole.TRIAL_ADMIN',
    'HeadCounsellor': 'com.medicalsystem.backend.model.UserRole.HEAD_COUNSELLOR',
    'SystemAdmin': 'com.medicalsystem.backend.model.UserRole.SYSTEM_ADMIN',
}

def extract_args(text, start_idx):
    # Find balancing parenthesis
    paren_count = 0
    idx = start_idx
    while idx < len(text):
        if text[idx] == '(':
            paren_count += 1
        elif text[idx] == ')':
            paren_count -= 1
            if paren_count == 0:
                return text[start_idx+1:idx], idx
        idx += 1
    return "", -1

for root, _, files in os.walk(test_dir):
    for file in files:
        if file.endswith('.kt'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            original_content = content
            
            for class_name, role in roles_map.items():
                while True:
                    match = re.search(rf'\b{class_name}\s*\(', content)
                    if not match:
                        break
                    
                    start_idx = match.end() - 1 # index of '('
                    args, end_idx = extract_args(content, start_idx)
                    
                    # Extract id
                    id_m = re.search(r'id\s*=\s*([^,]+)', args)
                    id_val = id_m.group(1).strip() if id_m else "1L"
                    
                    # Extract name
                    name_m = re.search(r'name\s*=\s*([^,]+)', args)
                    name_val = name_m.group(1).strip() if name_m else '"Mock User"'
                    
                    # Extract email (be careful with nested parenthesis, but regex works if simple)
                    email_m = re.search(r'email\s*=\s*(com\.medicalsystem\.backend\.model\.EmailAddress\([^)]+\)|EmailAddress\([^)]+\))', args)
                    email_val = email_m.group(1).strip() if email_m else 'com.medicalsystem.backend.model.EmailAddress("mock@univ.edu.cn")'
                    
                    replacement = f'com.medicalsystem.backend.model.User(id = {id_val}, name = {name_val}, email = {email_val}, role = {role})'
                    
                    content = content[:match.start()] + replacement + content[end_idx+1:]

            if content != original_content:
                with open(filepath, 'w') as f:
                    f.write(content)
                print(f"Updated {filepath}")
