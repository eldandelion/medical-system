package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.model.Student
import com.medicalsystem.backend.util.AcademicYearCalculator
import org.springframework.stereotype.Component

@Component
class StudentMapper(
    private val majorMapper: MajorMapper,
    private val academicYearCalculator: AcademicYearCalculator
) {
    fun toModel(entity: StudentEntity): Student {
        return Student(
            id = entity.id,
            studentNumber = entity.studentNumber,
            name = entity.name,
            major = majorMapper.toModel(entity.major),
            enrollmentDate = entity.enrollmentDate,
            riskStatus = entity.riskStatus
        )
    }

    fun toDto(model: Student): StudentDto {
        return StudentDto(
            id = model.id.toString(),
            studentNumber = model.studentNumber,
            name = model.name,
            majorId = model.major.id,
            major = model.major.name,
            enrollmentDate = model.enrollmentDate,
            year = academicYearCalculator.calculate(model.enrollmentDate),
            riskLevel = model.riskStatus,
            status = "Active"
        )
    }

    fun toEntity(model: Student): StudentEntity {
        return StudentEntity(
            id = model.id,
            studentNumber = model.studentNumber,
            name = model.name,
            major = majorMapper.toEntity(model.major),
            enrollmentDate = model.enrollmentDate,
            riskStatus = model.riskStatus
        )
    }
}
