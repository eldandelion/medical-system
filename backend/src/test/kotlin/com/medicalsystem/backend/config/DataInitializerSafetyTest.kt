package com.medicalsystem.backend.config

import org.junit.jupiter.api.Test
import org.mockito.Mockito.*
import org.springframework.boot.CommandLineRunner
import org.springframework.mock.env.MockEnvironment
import org.junit.jupiter.api.Assertions.*

class DataInitializerSafetyTest {
    @Test
    fun `unset false and invalid seed flags never touch data dependencies`() {
        for (value in listOf(null, "false", "yes", "1")) {
            val env = MockEnvironment()
            if (value != null) env.setProperty("SEED_DEMO_DATA", value)
            val initializer = DataInitializer(env)
            val method = DataInitializer::class.java.methods.single { it.name == "initData" }
            val dependencies = method.parameterTypes.map { mock(it) }.toTypedArray()
            val runner = method.invoke(initializer, *dependencies) as CommandLineRunner
            runner.run()
            dependencies.forEach { verifyNoInteractions(it) }
        }
    }

    @Test
    fun `explicit true reaches seeding while default is disabled`() {
        // Stop at the first SQL call: never execute a destructive SQL statement in this test.
        val initializer = DataInitializer(MockEnvironment().withProperty("SEED_DEMO_DATA", "true"))
        val method = DataInitializer::class.java.methods.single { it.name == "initData" }
        val dependencies = method.parameterTypes.map { mock(it) }.toTypedArray()
        val jdbc = dependencies.last() as org.springframework.jdbc.core.JdbcTemplate
        doThrow(AssertionError("seed reached")).`when`(jdbc).execute("SET FOREIGN_KEY_CHECKS = 0")
        val runner = method.invoke(initializer, *dependencies) as CommandLineRunner
        assertThrows(AssertionError::class.java) { runner.run() }
        verify(jdbc).execute("SET FOREIGN_KEY_CHECKS = 0")
    }
}
