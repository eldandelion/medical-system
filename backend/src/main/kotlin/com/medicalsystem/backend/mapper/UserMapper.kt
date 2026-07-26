package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.entity.UserEntity
import com.medicalsystem.backend.model.User
import org.springframework.stereotype.Component

@Component
class UserMapper {
    fun toModel(entity: UserEntity): User {
        return User(
            id = entity.id,
            name = entity.name,
            email = entity.email,
            role = entity.role
        )
    }

    fun toEntity(model: User): UserEntity {
        return UserEntity(
            id = model.id,
            name = model.name,
            email = model.email,
            role = model.role
        )
    }
}
