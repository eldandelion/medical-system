package com.medicalsystem.backend.config

import com.fasterxml.jackson.annotation.JsonValue
import com.fasterxml.jackson.databind.module.SimpleModule
import com.medicalsystem.backend.model.*
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class JacksonConfig {

    @Bean
    fun enumMixInModule(): SimpleModule {
        val module = SimpleModule()
        // Enum mixins removed to allow standard enum serialization (DDD)
        return module
    }
}
