package com.medicalsystem.backend.config

import org.junit.jupiter.api.Test
import org.mockito.Mockito.*
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.boot.CommandLineRunner
import org.springframework.mock.env.MockEnvironment
import org.junit.jupiter.api.Assertions.*

/**
 * Safety contract for the boot seeder (updated for the two-switch wipe guard):
 * - SEED_DEMO_DATA=false (or invalid values) must never seed or truncate. The runner
 *   may still read the student-row count (the fail-closed wipe guard needs it), but
 *   no destructive SQL and no inserts may happen.
 * - The destructive wipe path is a separate opt-in (SEED_WIPE_ALL_TABLES=true) that is
 *   REFUSED when the student table already holds more than the configured row budget;
 *   a restart must never silently truncate real data.
 * Full decision-matrix coverage lives in DataInitializerGuardTest.
 */
class DataInitializerSafetyTest {
    private fun runnerFor(vararg props: Pair<String, String>): Pair<CommandLineRunner, Array<Any>> {
        val env = MockEnvironment()
        props.forEach { (k, v) -> env.setProperty(k, v) }
        val initializer = DataInitializer(env)
        val method = DataInitializer::class.java.methods.single { it.name == "initData" }
        val dependencies = method.parameterTypes.map { mock(it) }.toTypedArray()
        return (method.invoke(initializer, *dependencies) as CommandLineRunner) to dependencies
    }

    @Test
    fun `seed flag false or invalid never seeds and never truncates`() {
        for (value in listOf("false", "yes", "1")) {
            val (runner, dependencies) = runnerFor("SEED_DEMO_DATA" to value)
            val jdbc = dependencies.last() as org.springframework.jdbc.core.JdbcTemplate
            val college = dependencies[2] as com.medicalsystem.backend.repository.CollegeJpaRepository
            runner.run()
            verify(jdbc, never()).execute(any(String::class.java))
            verify(college, never()).save(any())
        }
    }

    @Test
    fun `destructive wipe is refused once real student rows exist`() {
        // Student table holds more rows than the demo budget: the wipe must be refused
        // before any SQL executes and nothing may be seeded.
        val (runner, dependencies) = runnerFor(
            "SEED_DEMO_DATA" to "true",
            "SEED_WIPE_ALL_TABLES" to "true"
        )
        val jdbc = dependencies.last() as org.springframework.jdbc.core.JdbcTemplate
        val college = dependencies[2] as com.medicalsystem.backend.repository.CollegeJpaRepository
        val students = dependencies[4] as com.medicalsystem.backend.repository.StudentJpaRepository
        whenever(students.count()).thenReturn(100L)
        whenever(college.save(any())).thenAnswer { it.getArgument<com.medicalsystem.backend.entity.CollegeEntity>(0) }
        runner.run()
        verify(jdbc, never()).execute(any(String::class.java))
        verify(college, never()).save(any())
    }

    @Test
    fun `explicit seed opt-in reaches seeding and never truncates by default`() {
        // SEED_DEMO_DATA=true with an empty table reaches the seed path; without the
        // separate wipe opt-in no destructive SQL may run. Stop seeding at the first insert.
        val (runner, dependencies) = runnerFor("SEED_DEMO_DATA" to "true")
        val jdbc = dependencies.last() as org.springframework.jdbc.core.JdbcTemplate
        val college = dependencies[2] as com.medicalsystem.backend.repository.CollegeJpaRepository
        whenever(college.save(any())).thenThrow(AssertionError("seed reached"))
        assertThrows(AssertionError::class.java) { runner.run() }
        verify(jdbc, never()).execute(any(String::class.java))
    }
}
