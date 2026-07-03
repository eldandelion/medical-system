package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.entity.EthnicityEntity
import com.medicalsystem.backend.model.Ethnicity
import org.springframework.stereotype.Component

@Component
class EthnicityMapper {
    fun toModel(entity: EthnicityEntity): Ethnicity {
        return Ethnicity(
            id = entity.id,
            name = entity.name
        )
    }

    fun toEntity(model: Ethnicity): EthnicityEntity {
        return EthnicityEntity(
            id = model.id,
            name = model.name
        )
    }
}
