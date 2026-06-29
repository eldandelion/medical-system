package com.medicalsystem.backend.config

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.model.ReferralStatus
import com.medicalsystem.backend.model.RiskStatus
import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.repository.*
import com.medicalsystem.backend.service.StudentService
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.LocalDate
import java.time.LocalDateTime

@Configuration
class DataInitializer {

    @Bean
    fun initData(
        studentService: StudentService,
        studentRepository: StudentRepository,
        collegeRepository: CollegeRepository,
        majorRepository: MajorRepository,
        referralRepository: ReferralRepository
    ) = CommandLineRunner {
        referralRepository.deleteAll()
        studentRepository.deleteAll()
        majorRepository.deleteAll()
        collegeRepository.deleteAll()

        val medCollege = collegeRepository.save(CollegeEntity(name = "医学院"))
        val csCollege = collegeRepository.save(CollegeEntity(name = "计算机学院"))
        val engCollege = collegeRepository.save(CollegeEntity(name = "工程学院"))
        val busCollege = collegeRepository.save(CollegeEntity(name = "商学院"))

        val medMajor = majorRepository.save(MajorEntity(name = "临床医学", college = medCollege))
        val csMajor = majorRepository.save(MajorEntity(name = "计算机科学", college = csCollege))
        val engMajor = majorRepository.save(MajorEntity(name = "机械工程", college = engCollege))
        val busMajor = majorRepository.save(MajorEntity(name = "工商管理", college = busCollege))

        val s1 = studentRepository.save(StudentEntity(studentNumber = "S2023001", name = "李明", major = csMajor, enrollmentDate = LocalDate.of(2024, 9, 1), riskStatus = RiskStatus.MEDIUM))
        val s2 = studentRepository.save(StudentEntity(studentNumber = "S2023002", name = "王芳", major = engMajor, enrollmentDate = LocalDate.of(2023, 9, 1), riskStatus = RiskStatus.LOW))
        val s3 = studentRepository.save(StudentEntity(studentNumber = "S2023003", name = "张伟", major = busMajor, enrollmentDate = LocalDate.of(2025, 9, 1), riskStatus = RiskStatus.HIGH))
        val s4 = studentRepository.save(StudentEntity(studentNumber = "S2023004", name = "陈秀", major = medMajor, enrollmentDate = LocalDate.of(2022, 9, 1), riskStatus = RiskStatus.LOW))

        val ref1 = ReferralEntity(
            student = s1,
            type = "初次转诊",
            title = "期中考试后急性焦虑",
            description = "期中考试后出现急性恐慌发作和睡眠剥夺",
            riskLevel = RiskStatus.HIGH,
            status = ReferralStatus.AWAITING_FEEDBACK_APPROVAL,
            referredByName = "艾米丽·沃森",
            createdAt = LocalDateTime.now().minusDays(1)
        )
        val ref2 = ReferralEntity(
            student = s2,
            type = "随访",
            title = "每周治疗随访",
            description = "情绪持续低落",
            riskLevel = RiskStatus.MEDIUM,
            status = ReferralStatus.AWAITING_TRIAGE,
            referredByName = "艾米丽·沃森",
            createdAt = LocalDateTime.now().minusDays(2)
        )
        referralRepository.saveAll(listOf(ref1, ref2))

        println("Initialized Colleges, Majors, Students, and Referrals into the database.")
    }
}
