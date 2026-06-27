package com.medicalsystem.backend

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class BackendApplication {
    @org.springframework.context.annotation.Bean
    fun clock(): java.time.Clock = java.time.Clock.systemDefaultZone()
}

fun main(args: Array<String>) {
	runApplication<BackendApplication>(*args)
}
