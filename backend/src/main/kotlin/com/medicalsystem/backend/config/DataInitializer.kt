package com.medicalsystem.backend.config

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.service.StudentService
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile

@Configuration
class DataInitializer {

    @Bean
    fun initData(
        studentService: StudentService,
        studentRepository: com.medicalsystem.backend.repository.StudentRepository,
        collegeRepository: com.medicalsystem.backend.repository.CollegeRepository,
        majorRepository: com.medicalsystem.backend.repository.MajorRepository
    ) = CommandLineRunner {
        studentRepository.deleteAll()
        majorRepository.deleteAll()
        collegeRepository.deleteAll()

        val medCollege = collegeRepository.save(com.medicalsystem.backend.entity.CollegeEntity(name = "医学院"))
        val csCollege = collegeRepository.save(com.medicalsystem.backend.entity.CollegeEntity(name = "计算机学院"))
        val engCollege = collegeRepository.save(com.medicalsystem.backend.entity.CollegeEntity(name = "工程学院"))
        val busCollege = collegeRepository.save(com.medicalsystem.backend.entity.CollegeEntity(name = "商学院"))

        val medMajor = majorRepository.save(com.medicalsystem.backend.entity.MajorEntity(name = "临床医学", college = medCollege))
        val csMajor = majorRepository.save(com.medicalsystem.backend.entity.MajorEntity(name = "计算机科学", college = csCollege))
        val engMajor = majorRepository.save(com.medicalsystem.backend.entity.MajorEntity(name = "机械工程", college = engCollege))
        val busMajor = majorRepository.save(com.medicalsystem.backend.entity.MajorEntity(name = "工商管理", college = busCollege))

        val dummyStudents = listOf(
            StudentDto(id = null, studentNumber = "S2023001", name = "李明", majorId = csMajor.id, major = null, enrollmentDate = java.time.LocalDate.of(2024, 9, 1), year = null, riskLevel = com.medicalsystem.backend.entity.RiskStatus.MEDIUM),
            StudentDto(id = null, studentNumber = "S2023002", name = "王芳", majorId = engMajor.id, major = null, enrollmentDate = java.time.LocalDate.of(2023, 9, 1), year = null, riskLevel = com.medicalsystem.backend.entity.RiskStatus.LOW),
            StudentDto(id = null, studentNumber = "S2023003", name = "张伟", majorId = busMajor.id, major = null, enrollmentDate = java.time.LocalDate.of(2025, 9, 1), year = null, riskLevel = com.medicalsystem.backend.entity.RiskStatus.HIGH),
            StudentDto(id = null, studentNumber = "S2023004", name = "陈秀", majorId = medMajor.id, major = null, enrollmentDate = java.time.LocalDate.of(2022, 9, 1), year = null, riskLevel = com.medicalsystem.backend.entity.RiskStatus.LOW)
        )
        
        dummyStudents.forEach { studentService.createStudent(it) }
        println("Initialized Colleges, Majors, and 4 Chinese students into the database.")
    }
}
