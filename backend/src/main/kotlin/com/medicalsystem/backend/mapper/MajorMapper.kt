package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.entity.MajorEntity
import com.medicalsystem.backend.model.Major
import org.springframework.stereotype.Component

@Component
class MajorMapper(private val collegeMapper: CollegeMapper) {
    fun toModel(entity: MajorEntity): Major {
        return Major(
            id = entity.id,
            name = entity.name,
            college = collegeMapper.toModel(entity.college)
        )
    }

    fun toEntity(model: Major): MajorEntity {
        return MajorEntity(
            id = model.id,
            name = model.name,
            college = collegeMapper.toEntity(model.college)
        )
    }
}
