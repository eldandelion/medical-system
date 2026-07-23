package com.medicalsystem.backend.converter

import com.medicalsystem.backend.model.EmailAddress
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter(autoApply = true)
class EmailAddressConverter : AttributeConverter<EmailAddress, String> {
    override fun convertToDatabaseColumn(attribute: EmailAddress?) = attribute?.value
    override fun convertToEntityAttribute(dbData: String?) = dbData?.let { EmailAddress(it) }
}
