package com.medicalsystem.backend.converter

import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.PersonName
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter(autoApply = true)
class EmailAddressConverter : AttributeConverter<EmailAddress, String> {
    override fun convertToDatabaseColumn(attribute: EmailAddress?) = attribute?.value
    override fun convertToEntityAttribute(dbData: String?) = dbData?.let { EmailAddress(it) }
}

@Converter(autoApply = true)
class PersonNameConverter : AttributeConverter<PersonName, String> {
    override fun convertToDatabaseColumn(attribute: PersonName?) = attribute?.value
    override fun convertToEntityAttribute(dbData: String?) = dbData?.let { PersonName(it) }
}
