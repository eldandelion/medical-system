package com.medicalsystem.backend.converter

import com.medicalsystem.backend.model.ReferenceDataStatus
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter(autoApply = true)
class ReferenceDataStatusConverter : AttributeConverter<ReferenceDataStatus, Int> {
    override fun convertToDatabaseColumn(attribute: ReferenceDataStatus?): Int? {
        return attribute?.let { it.ordinal + 1 }
    }

    override fun convertToEntityAttribute(dbData: Int?): ReferenceDataStatus? {
        return dbData?.let {
            val values = ReferenceDataStatus.values()
            if (it in 1..values.size) values[it - 1] else ReferenceDataStatus.ACTIVE
        }
    }
}
