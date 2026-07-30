package com.medicalsystem.backend.converter

import com.medicalsystem.backend.model.NotificationActionType
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter(autoApply = true)
class NotificationActionTypeConverter : AttributeConverter<NotificationActionType, Int> {
    override fun convertToDatabaseColumn(attribute: NotificationActionType?): Int {
        return attribute?.code ?: NotificationActionType.NONE.code
    }

    override fun convertToEntityAttribute(dbData: Int?): NotificationActionType {
        return dbData?.let { NotificationActionType.fromCode(it) } ?: NotificationActionType.NONE
    }
}
