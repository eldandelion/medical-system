package com.medicalsystem.backend.converter

import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.IdCardNumber
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

@Converter(autoApply = true)
class IdCardNumberConverter : AttributeConverter<IdCardNumber, String> {
    override fun convertToDatabaseColumn(attribute: IdCardNumber?) = attribute?.value
    override fun convertToEntityAttribute(dbData: String?) = dbData?.let { IdCardNumber(it) }
}

