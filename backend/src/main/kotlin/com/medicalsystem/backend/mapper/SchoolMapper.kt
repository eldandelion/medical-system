package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.entity.SchoolEntity
import com.medicalsystem.backend.model.School
import org.springframework.stereotype.Component

@Component
class SchoolMapper {
    fun toModel(entity: SchoolEntity): School {
        return School(
            id = entity.id,
            name = entity.name
        )
    }

    fun toEntity(model: School): SchoolEntity {
        return SchoolEntity(
            id = model.id,
            name = model.name
        )
    }
}
