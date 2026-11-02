package com.medicalsystem.backend.service

import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.repository.StudentJpaRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.mockito.kotlin.*
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.datasource.DataSourceTransactionManager
import org.springframework.jdbc.datasource.DriverManagerDataSource
import org.springframework.transaction.support.TransactionTemplate
import java.util.Optional
import java.util.UUID

class DemographicsProjectionTransactionTest {
    @Test
    fun `real uniqueness failure rolls back projection but not committed submission`() {
        val ds = DriverManagerDataSource("jdbc:h2:mem:${UUID.randomUUID()};DB_CLOSE_DELAY=-1", "sa", "")
        val jdbc = JdbcTemplate(ds)
        jdbc.execute("create table core_submission (id int primary key)")
        jdbc.execute("create table optional_projection (id int primary key)")
        val manager = DataSourceTransactionManager(ds)
        val core = TransactionTemplate(manager)
        val students = mock<StudentJpaRepository>()
        val projector = mock<DemographicsProjector>()
        val student = mock<StudentEntity>()
        whenever(students.findById(1L)).thenReturn(Optional.of(student))
        doAnswer {
            assertEquals(1, jdbc.queryForObject("select count(*) from core_submission", Int::class.java))
            jdbc.update("insert into optional_projection values (1)")
            jdbc.update("insert into optional_projection values (1)") // actual H2 constraint violation
            null
        }.whenever(projector).projectDemographics(eq(student), any())
        val service = DemographicsProjectionService(students, projector, manager)
        core.executeWithoutResult {
            jdbc.update("insert into core_submission values (1)")
            service.afterSubmission(1L, mapOf("email" to "synthetic@example.test"))
            verifyNoInteractions(projector)
        }
        verify(projector).projectDemographics(eq(student), any())
        assertEquals(1, jdbc.queryForObject("select count(*) from core_submission", Int::class.java))
        assertEquals(0, jdbc.queryForObject("select count(*) from optional_projection", Int::class.java))
    }

    @Test
    fun `core rollback never runs optional projection`() {
        val ds = DriverManagerDataSource("jdbc:h2:mem:${UUID.randomUUID()};DB_CLOSE_DELAY=-1", "sa", "")
        val manager = DataSourceTransactionManager(ds)
        val students = mock<StudentJpaRepository>()
        val projector = mock<DemographicsProjector>()
        val service = DemographicsProjectionService(students, projector, manager)
        TransactionTemplate(manager).executeWithoutResult { status ->
            service.afterSubmission(1L, emptyMap())
            status.setRollbackOnly()
        }
        verifyNoInteractions(students, projector)
    }
}
