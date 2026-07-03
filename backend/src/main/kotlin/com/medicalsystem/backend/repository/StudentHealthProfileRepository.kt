package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.StudentHealthProfile
import java.util.Optional

interface StudentHealthProfileRepository {
    fun findByStudentId(studentId: Long): Optional<StudentHealthProfile>
    fun save(profile: StudentHealthProfile): StudentHealthProfile
}
