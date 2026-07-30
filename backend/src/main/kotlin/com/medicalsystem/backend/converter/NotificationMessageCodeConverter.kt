package com.medicalsystem.backend.converter

import com.medicalsystem.backend.model.NotificationMessageCode
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter(autoApply = true)
class NotificationMessageCodeConverter : AttributeConverter<NotificationMessageCode, Int> {
    override fun convertToDatabaseColumn(attribute: NotificationMessageCode?): Int {
        // Assume default or null handling if necessary, though it shouldn't be null
        return attribute?.code ?: 0 
    }

    override fun convertToEntityAttribute(dbData: Int?): NotificationMessageCode {
        return dbData?.let { NotificationMessageCode.fromCode(it) } 
            ?: throw IllegalArgumentException("Unknown code")
    }
}
