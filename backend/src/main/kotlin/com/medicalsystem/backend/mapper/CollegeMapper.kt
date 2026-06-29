package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.entity.CollegeEntity
import com.medicalsystem.backend.model.College
import org.springframework.stereotype.Component

@Component
class CollegeMapper {
    fun toModel(entity: CollegeEntity): College {
        return College(
            id = entity.id,
            name = entity.name
        )
    }

    fun toEntity(model: College): CollegeEntity {
        return CollegeEntity(
            id = model.id,
            name = model.name
        )
    }
}
