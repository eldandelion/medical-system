package com.medicalsystem.backend.converter

import com.medicalsystem.backend.model.AssessmentScaleType
import com.medicalsystem.backend.model.AssessmentStatus
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter(autoApply = true)
class AssessmentScaleTypeConverter : AttributeConverter<AssessmentScaleType, Int> {
    override fun convertToDatabaseColumn(attribute: AssessmentScaleType?) = getIdFromEnum(attribute)
    override fun convertToEntityAttribute(dbData: Int?) = getEnumFromId<AssessmentScaleType>(dbData)
}

@Converter(autoApply = true)
class AssessmentStatusConverter : AttributeConverter<AssessmentStatus, Int> {
    override fun convertToDatabaseColumn(attribute: AssessmentStatus?) = getIdFromEnum(attribute)
    override fun convertToEntityAttribute(dbData: Int?) = getEnumFromId<AssessmentStatus>(dbData)
}
