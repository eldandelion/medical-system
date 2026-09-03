package com.medicalsystem.backend.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import java.util.concurrent.Executor

@Configuration
@EnableAsync
class MailAsyncConfig {

    @Bean(name = ["mailTaskExecutor"])
    fun mailTaskExecutor(): Executor {
        return ThreadPoolTaskExecutor().apply {
            corePoolSize = 2
            maxPoolSize = 8
            queueCapacity = 200
            setThreadNamePrefix("MailAsync-")
            initialize()
        }
    }
}
