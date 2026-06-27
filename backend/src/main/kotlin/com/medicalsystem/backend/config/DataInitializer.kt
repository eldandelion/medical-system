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
    fun initData(studentService: StudentService, studentRepository: com.medicalsystem.backend.repository.StudentRepository) = CommandLineRunner {
        studentRepository.deleteAll() // Clear existing data to apply the new Chinese records
        val dummyStudents = listOf(
            StudentDto(null, "S2023001", "李明", "计算机科学", "大二", "Active"),
            StudentDto(null, "S2023002", "王芳", "机械工程", "大三", "Active"),
            StudentDto(null, "S2023003", "张伟", "工商管理", "大一", "Inactive"),
            StudentDto(null, "S2023004", "陈秀", "临床医学", "大四", "Active")
        )
        
        dummyStudents.forEach { studentService.createStudent(it) }
        println("Initialized 4 dummy Chinese students into the database.")
    }
}
