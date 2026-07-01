package com.medicalsystem.backend.config

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.model.*
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
        referralRepository: ReferralRepository,
        ethnicityRepository: EthnicityRepository,
        schoolRepository: SchoolRepository,
        hospitalRepository: HospitalRepository,
        departmentRepository: DepartmentRepository,
        doctorRepository: DoctorRepository,
        adminRepository: AdminRepository
    ) = CommandLineRunner {
        referralRepository.deleteAll()
        studentRepository.deleteAll()
        majorRepository.deleteAll()
        collegeRepository.deleteAll()
        ethnicityRepository.deleteAll()
        schoolRepository.deleteAll()
        hospitalRepository.deleteAll()
        departmentRepository.deleteAll()
        doctorRepository.deleteAll()
        adminRepository.deleteAll()

        val medCollege = collegeRepository.save(CollegeEntity(name = "医学院"))
        val csCollege = collegeRepository.save(CollegeEntity(name = "计算机学院"))
        val engCollege = collegeRepository.save(CollegeEntity(name = "工程学院"))
        val busCollege = collegeRepository.save(CollegeEntity(name = "商学院"))

        val medMajor = majorRepository.save(MajorEntity(name = "临床医学", college = medCollege))
        val csMajor = majorRepository.save(MajorEntity(name = "计算机科学", college = csCollege))
        val engMajor = majorRepository.save(MajorEntity(name = "机械工程", college = engCollege))
        val busMajor = majorRepository.save(MajorEntity(name = "工商管理", college = busCollege))

        val han = ethnicityRepository.save(EthnicityEntity(name = "汉族"))
        val hui = ethnicityRepository.save(EthnicityEntity(name = "回族"))
        val man = ethnicityRepository.save(EthnicityEntity(name = "满族"))

        val mainSchool = schoolRepository.save(SchoolEntity(name = "某重点大学"))

        val s1Demo = StudentDemographics(gender = Gender.MALE, dateOfBirth = LocalDate.of(2004, 5, 12), ethnicity = han, idCardNumber = "110105200405123456", contactNumber = "13800138000", email = "liming@univ.edu.cn", homeAddress = "北京市朝阳区某街道", emergencyContactName = "李建国", emergencyContactPhone = "13900139000", school = mainSchool)
        val s2Demo = StudentDemographics(gender = Gender.FEMALE, dateOfBirth = LocalDate.of(2003, 8, 24), ethnicity = hui, idCardNumber = "310101200308241234", contactNumber = "13700137000", email = "wangfang@univ.edu.cn", homeAddress = "上海市黄浦区某街道", emergencyContactName = "王强", emergencyContactPhone = "13600136000", school = mainSchool)
        val s3Demo = StudentDemographics(gender = Gender.MALE, dateOfBirth = LocalDate.of(2005, 11, 2), ethnicity = han, idCardNumber = "440106200511025678", contactNumber = "13500135000", email = "zhangwei@univ.edu.cn", homeAddress = "广州市天河区某街道", emergencyContactName = "张明", emergencyContactPhone = "13400134000", school = mainSchool)
        val s4Demo = StudentDemographics(gender = Gender.FEMALE, dateOfBirth = LocalDate.of(2002, 3, 15), ethnicity = man, idCardNumber = "210102200203158901", contactNumber = "13300133000", email = "chenxiu@univ.edu.cn", homeAddress = "沈阳市和平区某街道", emergencyContactName = "陈军", emergencyContactPhone = "13200132000", school = mainSchool)

        val s1 = studentRepository.save(StudentEntity(studentNumber = "S2023001", name = "李明", major = csMajor, enrollmentDate = LocalDate.of(2024, 9, 1), riskStatus = RiskStatus.MEDIUM, demographics = s1Demo, scidDiagnosis = "重度抑郁症，伴随焦虑症状"))
        val s2 = studentRepository.save(StudentEntity(studentNumber = "S2023002", name = "王芳", major = engMajor, enrollmentDate = LocalDate.of(2023, 9, 1), riskStatus = RiskStatus.LOW, demographics = s2Demo))
        val s3 = studentRepository.save(StudentEntity(studentNumber = "S2023003", name = "张伟", major = busMajor, enrollmentDate = LocalDate.of(2025, 9, 1), riskStatus = RiskStatus.HIGH, demographics = s3Demo, scidDiagnosis = "广泛性焦虑障碍"))
        val s4 = studentRepository.save(StudentEntity(studentNumber = "S2023004", name = "陈秀", major = medMajor, enrollmentDate = LocalDate.of(2022, 9, 1), riskStatus = RiskStatus.LOW, demographics = s4Demo))

        // Add Psychometrics for s1 (李明)
        val rf1 = RiskFlagEntity(name = com.medicalsystem.backend.model.RiskFlagName.SUICIDAL_IDEATION, status = com.medicalsystem.backend.model.FlagStatus.POSITIVE, student = s1)
        val rf2 = RiskFlagEntity(name = com.medicalsystem.backend.model.RiskFlagName.SELF_HARM, status = com.medicalsystem.backend.model.FlagStatus.NEGATIVE, student = s1)
        s1.riskFlags.addAll(listOf(rf1, rf2))
        
        val pt1 = PsychometricTestEntity(testResultName = com.medicalsystem.backend.model.TestResultName.GAD_7, score = 15, maxScore = 21, level = "重度", testDate = LocalDate.now().minusDays(30), student = s1)
        val pt2 = PsychometricTestEntity(testResultName = com.medicalsystem.backend.model.TestResultName.GAD_7, score = 18, maxScore = 21, level = "重度", testDate = LocalDate.now().minusDays(15), student = s1)
        val pt3 = PsychometricTestEntity(testResultName = com.medicalsystem.backend.model.TestResultName.GAD_7, score = 20, maxScore = 21, level = "重度", testDate = LocalDate.now().minusDays(5), student = s1)
        val pt4 = PsychometricTestEntity(testResultName = com.medicalsystem.backend.model.TestResultName.PHQ_9, score = 22, maxScore = 27, level = "重度", testDate = LocalDate.now().minusDays(5), student = s1)
        val pt5 = PsychometricTestEntity(testResultName = com.medicalsystem.backend.model.TestResultName.PSQI, score = 16, maxScore = 21, level = "较差", testDate = LocalDate.now().minusDays(5), student = s1)
        s1.psychometricTests.addAll(listOf(pt1, pt2, pt3, pt4, pt5))
        studentRepository.save(s1)

        // Add Psychometrics for s3 (张伟)
        val rf3 = RiskFlagEntity(name = com.medicalsystem.backend.model.RiskFlagName.SUICIDE_ATTEMPT, status = com.medicalsystem.backend.model.FlagStatus.POSITIVE, student = s3)
        s3.riskFlags.add(rf3)
        val pt6 = PsychometricTestEntity(testResultName = com.medicalsystem.backend.model.TestResultName.GAD_7, score = 12, maxScore = 21, level = "中度", testDate = LocalDate.now().minusDays(10), student = s3)
        s3.psychometricTests.add(pt6)
        studentRepository.save(s3)

        val hosp = hospitalRepository.save(HospitalEntity(name = "市精神卫生中心", address = "市中心大道1号", contactPhone = "021-12345678"))
        val dept = departmentRepository.save(DepartmentEntity(name = "临床心理科", hospital = hosp))
        val doc = doctorRepository.save(DoctorEntity(name = "王建国", department = dept, phone = "13912345678"))
        val admin = adminRepository.save(AdminEntity(name = "张老师", role = "分诊管理员"))

        val dest = ReferralDestination(
            hospital = hosp,
            department = dept,
            doctor = doc,
            admin = admin,
            transferDate = LocalDate.now().plusDays(2),
            appointmentTime = LocalDateTime.now().plusDays(2).withHour(10).withMinute(0)
        )

        val ref1 = ReferralEntity(
            student = s1,
            type = ReferralType.INITIAL,
            title = "期中考试后急性焦虑",
            description = "期中考试后出现急性恐慌发作和睡眠剥夺",
            riskLevel = RiskStatus.HIGH,
            status = ReferralStatus.AWAITING_FEEDBACK_APPROVAL,
            referredByName = "艾米丽·沃森",
            createdAt = LocalDateTime.now().minusDays(1),
            destination = dest
        )
        
        val step1 = ReferralStepEntity(
            referral = ref1,
            type = ReferralStepType.INITIATION,
            title = "发起转诊",
            subtitle = "由辅导员提交",
            time = LocalDateTime.now().minusDays(1),
            status = ReferralStepStatus.COMPLETED,
            actor = admin
        )
        val step2 = ReferralStepEntity(
            referral = ref1,
            type = ReferralStepType.REVIEW,
            title = "转诊审核",
            subtitle = "等待院级审批",
            time = LocalDateTime.now().minusHours(20),
            status = ReferralStepStatus.COMPLETED,
            actor = admin
        )
        val step3 = ReferralStepEntity(
            referral = ref1,
            type = ReferralStepType.TRIAGE,
            title = "分诊评估",
            subtitle = "分诊至市精神卫生中心",
            time = LocalDateTime.now().minusHours(18),
            status = ReferralStepStatus.COMPLETED,
            actor = admin
        )
        val step4 = ReferralStepEntity(
            referral = ref1,
            type = ReferralStepType.SCHEDULING,
            title = "预约安排",
            subtitle = "等待预约确认",
            time = LocalDateTime.now().minusHours(5),
            status = ReferralStepStatus.ACTIVE,
            actor = admin
        )
        
        ref1.steps.addAll(listOf(step1, step2, step3, step4))

        val ref2 = ReferralEntity(
            student = s2,
            type = ReferralType.FOLLOW_UP,
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
