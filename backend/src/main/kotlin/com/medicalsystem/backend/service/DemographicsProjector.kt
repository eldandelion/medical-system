package com.medicalsystem.backend.service

import com.medicalsystem.backend.config.AssessmentCatalogLoader
import com.medicalsystem.backend.entity.StudentDemographicsEntity
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.model.AssessmentQuestion
import com.medicalsystem.backend.model.Gender
import com.medicalsystem.backend.repository.EthnicityJpaRepository
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
class DemographicsProjector(
    private val catalogLoader: AssessmentCatalogLoader,
    private val ethnicityJpaRepository: EthnicityJpaRepository
) {
    fun projectDemographics(student: StudentEntity, answers: Map<String, Any>) {
        if (answers.isEmpty()) return

        val demoScale = catalogLoader.getScaleDetail("demographics_survey")
        val questionsByField = demoScale?.questions?.filter { it.field != null }?.associateBy { it.field!! } ?: emptyMap()

        val idCard = resolveText(questionsByField["idCardNumber"], answers, listOf("demo_id_card", "idCardNumber"))
        val birthdayAnswer = resolveText(questionsByField["birthday"], answers, listOf("G2", "birthday", "dateOfBirth", "birthDate"))
        val birthday = extractBirthday(idCard, birthdayAnswer)

        val rawGender = resolveChoice(questionsByField["gender"], answers, listOf("G1", "demo_gender", "gender"))
        val gender = when (rawGender) {
            "1", "男", "MALE" -> Gender.MALE
            "2", "女", "FEMALE" -> Gender.FEMALE
            else -> if (idCard != null && idCard.length == 18) {
                val code = idCard.substring(16, 17).toIntOrNull()
                if (code != null) if (code % 2 == 1) Gender.MALE else Gender.FEMALE else null
            } else null
        }

        val rawEthnicity = resolveChoice(questionsByField["ethnicity"], answers, listOf("G4", "demo_ethnicity", "ethnicity")) ?: "汉族"
        val ethnicityEntity = ethnicityJpaRepository.findByName(rawEthnicity).orElseGet {
            ethnicityJpaRepository.findAll().firstOrNull()
        }

        val contactNumber = resolveText(questionsByField["phone"], answers, listOf("demo_phone", "phone", "contactNumber"))
        val email = resolveText(questionsByField["email"], answers, listOf("demo_email", "email"))
        val address = resolveText(null, answers, listOf("demo_home_address", "homeAddress"))
            ?: resolveChoice(questionsByField["homeAddress"], answers, listOf("G6"))
        val emergencyContact = resolveText(questionsByField["emergencyContact"], answers, listOf("demo_emergency_contact", "emergencyContactName"))
        val emergencyPhone = resolveText(questionsByField["emergencyPhone"], answers, listOf("demo_emergency_phone", "emergencyContactPhone"))

        val currentDemo = student.demographics ?: StudentDemographicsEntity()
        if (gender != null) currentDemo.gender = gender
        if (birthday != null) currentDemo.dateOfBirth = birthday
        if (ethnicityEntity != null) currentDemo.ethnicity = ethnicityEntity
        if (idCard != null) currentDemo.idCardNumber = idCard
        if (contactNumber != null) currentDemo.contactNumber = contactNumber
        if (email != null) currentDemo.email = email
        if (address != null) currentDemo.homeAddress = address
        if (emergencyContact != null) currentDemo.emergencyContactName = emergencyContact
        if (emergencyPhone != null) currentDemo.emergencyContactPhone = emergencyPhone

        student.demographics = currentDemo
    }

    private fun resolveChoice(question: AssessmentQuestion?, answers: Map<String, Any>, fallbackKeys: List<String>): String? {
        val rawVal = (question?.let { answers[it.code] } ?: fallbackKeys.firstNotNullOfOrNull { answers[it] })?.toString()?.trim()
            ?: return null

        if (question != null && question.effectiveOptions.isNotEmpty()) {
            val matched = question.effectiveOptions.find { it.value.toString() == rawVal }
            if (matched != null) return matched.label
        }

        return when (rawVal) {
            "1" -> "男"
            "2" -> "女"
            else -> rawVal
        }
    }

    private fun resolveText(question: AssessmentQuestion?, answers: Map<String, Any>, fallbackKeys: List<String>): String? {
        val raw = (question?.let { answers[it.code] } ?: fallbackKeys.firstNotNullOfOrNull { answers[it] })?.toString()?.trim()
        return if (raw.isNullOrEmpty()) null else raw
    }

    private fun extractBirthday(idCard: String?, birthdayStr: String?): LocalDate? {
        if (!birthdayStr.isNullOrBlank()) {
            try {
                return LocalDate.parse(birthdayStr.trim())
            } catch (_: Exception) {}
        }
        if (idCard != null && idCard.length == 18) {
            try {
                val year = idCard.substring(6, 10).toInt()
                val month = idCard.substring(10, 12).toInt()
                val day = idCard.substring(12, 14).toInt()
                return LocalDate.of(year, month, day)
            } catch (_: Exception) {}
        }
        return null
    }
}
