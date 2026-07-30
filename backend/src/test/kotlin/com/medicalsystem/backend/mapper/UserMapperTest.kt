package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.entity.UserEntity
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class UserMapperTest {

    private val mapper = UserMapper()

    @Test
    fun `toModel should correctly map UserEntity`() {
        val entity = UserEntity(
            id = 1L,
            name = "Test User",
            email = com.medicalsystem.backend.model.EmailAddress("user@test.com"),
            role = UserRole.DOCTOR
        )

        val model = mapper.toModel(entity)

        assertEquals(1L, model.id)
        assertEquals("Test User", model.name)
        assertEquals(com.medicalsystem.backend.model.EmailAddress("user@test.com"), model.email)
        assertEquals(UserRole.DOCTOR, model.role)
    }

    @Test
    fun `toEntity should correctly map User model`() {
        val model = User(
            id = 2L,
            name = "Test User 2",
            email = com.medicalsystem.backend.model.EmailAddress("user2@test.com"),
            role = UserRole.TEACHER
        )

        val entity = mapper.toEntity(model)

        assertEquals(2L, entity.id)
        assertEquals("Test User 2", entity.name)
        assertEquals(com.medicalsystem.backend.model.EmailAddress("user2@test.com"), entity.email)
        assertEquals(UserRole.TEACHER, entity.role)
    }
}
