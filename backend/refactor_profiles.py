import os
import re

base_dir = "/Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend"
test_dir = "/Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend"

# 1. Create the new domain files
model_dir = os.path.join(base_dir, "model")
doctor_kt = os.path.join(model_dir, "Doctor.kt")
teacher_kt = os.path.join(model_dir, "Teacher.kt")
trial_admin_kt = os.path.join(model_dir, "TrialAdmin.kt")
head_counsellor_kt = os.path.join(model_dir, "HeadCounsellor.kt")

with open(doctor_kt, "w") as f:
    f.write("package com.medicalsystem.backend.model\n\ndata class Doctor(\n    val userId: Long,\n    val employeeNumber: HospitalEmployeeId,\n    val departmentId: Long,\n    val phone: PhoneNumber?\n)\n")
with open(teacher_kt, "w") as f:
    f.write("package com.medicalsystem.backend.model\n\ndata class Teacher(\n    val userId: Long,\n    val employeeNumber: SchoolEmployeeId,\n    val collegeId: Long\n)\n")
with open(trial_admin_kt, "w") as f:
    f.write("package com.medicalsystem.backend.model\n\ndata class TrialAdmin(\n    val userId: Long,\n    val employeeNumber: HospitalEmployeeId,\n    val hospitalId: Long\n)\n")
with open(head_counsellor_kt, "w") as f:
    f.write("package com.medicalsystem.backend.model\n\ndata class HeadCounsellor(\n    val userId: Long\n)\n")

# 2. Delete Profiles.kt and StudentUserEntity.kt
profiles_kt = os.path.join(model_dir, "Profiles.kt")
if os.path.exists(profiles_kt):
    os.remove(profiles_kt)

student_user_entity = os.path.join(base_dir, "entity", "StudentUserEntity.kt")
if os.path.exists(student_user_entity):
    os.remove(student_user_entity)

# 3. Modify ProfileRepositories.kt
repos_file = os.path.join(base_dir, "repository", "ProfileRepositories.kt")
with open(repos_file, "r") as f:
    repos_content = f.read()
repos_content = re.sub(r'interface StudentUserRepository.*\n', '', repos_content)
with open(repos_file, "w") as f:
    f.write(repos_content)

# 4. Modify ProfileMapper.kt
mapper_file = os.path.join(base_dir, "mapper", "ProfileMapper.kt")
with open(mapper_file, "r") as f:
    mapper_content = f.read()

mapper_content = mapper_content.replace("toDoctorProfile", "toDoctor")
mapper_content = mapper_content.replace("DoctorProfile", "Doctor")
mapper_content = mapper_content.replace("toTeacherProfile", "toTeacher")
mapper_content = mapper_content.replace("TeacherProfile", "Teacher")
mapper_content = mapper_content.replace("toHeadCounsellorProfile", "toHeadCounsellor")
mapper_content = mapper_content.replace("HeadCounsellorProfile", "HeadCounsellor")
mapper_content = mapper_content.replace("toTrialAdminProfile", "toTrialAdmin")
mapper_content = mapper_content.replace("TrialAdminProfile", "TrialAdmin")
mapper_content = mapper_content.replace("import com.medicalsystem.backend.entity.StudentUserEntity\n", "")

# Remove Student methods
mapper_content = re.sub(r'    fun toStudentProfile\([^}]+\}?\n?.*?\n    \}', '', mapper_content, flags=re.DOTALL)
mapper_content = re.sub(r'    fun toStudentEntity\([^}]+\}?\n?.*?\n    \}', '', mapper_content, flags=re.DOTALL)

with open(mapper_file, "w") as f:
    f.write(mapper_content)

# 5. DataInitializer.kt
init_file = os.path.join(base_dir, "config", "DataInitializer.kt")
with open(init_file, "r") as f:
    init_content = f.read()
init_content = re.sub(r'private val studentUserRepository: StudentUserRepository,\n\s*', '', init_content)
init_content = re.sub(r'val studentUser = studentUserRepository\.save\(StudentUserEntity\(userId = studentUserBase\.id\)\)\n\s*', '', init_content)
init_content = init_content.replace("import com.medicalsystem.backend.repository.StudentUserRepository", "")
init_content = init_content.replace("import com.medicalsystem.backend.entity.StudentUserEntity", "")
with open(init_file, "w") as f:
    f.write(init_content)
print("done")
