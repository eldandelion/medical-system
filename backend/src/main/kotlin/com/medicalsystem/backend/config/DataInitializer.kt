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
    fun initData(studentService: StudentService) = CommandLineRunner {
        if (studentService.getAllStudents().isEmpty()) {
            val dummyStudents = listOf(
                StudentDto(null, "S2023001", "Li Ming", "Computer Science", "Year 2", "Active"),
                StudentDto(null, "S2023002", "Wang Fang", "Mechanical Engineering", "Year 3", "Active"),
                StudentDto(null, "S2023003", "Zhang Wei", "Business Administration", "Year 1", "Inactive"),
                StudentDto(null, "S2023004", "Chen Xiu", "Medicine", "Year 4", "Active")
            )
            
            dummyStudents.forEach { studentService.createStudent(it) }
            println("Initialized 4 dummy students into the database.")
        }
    }
}
