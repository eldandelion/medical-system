package com.medicalsystem.backend.config

import com.fasterxml.jackson.annotation.JsonValue
import com.fasterxml.jackson.databind.module.SimpleModule
import com.medicalsystem.backend.model.*
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

interface EnumMixIn {
    @JsonValue
    fun toValue(): String
}

@Configuration
class JacksonConfig {

    @Bean
    fun enumMixInModule(): SimpleModule {
        val module = SimpleModule()
        module.setMixInAnnotation(AcademicYear::class.java, EnumMixIn::class.java)
        module.setMixInAnnotation(ClinicalStatusType::class.java, EnumMixIn::class.java)
        module.setMixInAnnotation(ReferralStatus::class.java, EnumMixIn::class.java)
        module.setMixInAnnotation(ReferralStepStatus::class.java, EnumMixIn::class.java)
        module.setMixInAnnotation(ReferralStepType::class.java, EnumMixIn::class.java)
        module.setMixInAnnotation(ReferralType::class.java, EnumMixIn::class.java)
        module.setMixInAnnotation(RiskStatus::class.java, EnumMixIn::class.java)
        return module
    }
}
