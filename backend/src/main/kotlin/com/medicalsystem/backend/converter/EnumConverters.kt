package com.medicalsystem.backend.converter

import com.medicalsystem.backend.model.*
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

inline fun <reified E : Enum<E>> getEnumFromId(id: Int?): E? {
    if (id == null) return null
    return enumValues<E>().getOrNull(id - 1)
}

inline fun <reified E : Enum<E>> getIdFromEnum(e: E?): Int? {
    if (e == null) return null
    return e.ordinal + 1
}

@Converter(autoApply = true)
class UserRoleConverter : AttributeConverter<UserRole, Int> {
    override fun convertToDatabaseColumn(attribute: UserRole?) = getIdFromEnum(attribute)
    override fun convertToEntityAttribute(dbData: Int?) = getEnumFromId<UserRole>(dbData)
}

@Converter(autoApply = true)
class GenderConverter : AttributeConverter<Gender, Int> {
    override fun convertToDatabaseColumn(attribute: Gender?) = getIdFromEnum(attribute)
    override fun convertToEntityAttribute(dbData: Int?) = getEnumFromId<Gender>(dbData)
}

@Converter(autoApply = true)
class ReferralStatusConverter : AttributeConverter<ReferralStatus, Int> {
    override fun convertToDatabaseColumn(attribute: ReferralStatus?) = getIdFromEnum(attribute)
    override fun convertToEntityAttribute(dbData: Int?) = getEnumFromId<ReferralStatus>(dbData)
}

@Converter(autoApply = true)
class ReferralTypeConverter : AttributeConverter<ReferralType, Int> {
    override fun convertToDatabaseColumn(attribute: ReferralType?) = getIdFromEnum(attribute)
    override fun convertToEntityAttribute(dbData: Int?) = getEnumFromId<ReferralType>(dbData)
}

@Converter(autoApply = true)
class ReferralStepTypeConverter : AttributeConverter<ReferralStepType, Int> {
    override fun convertToDatabaseColumn(attribute: ReferralStepType?) = getIdFromEnum(attribute)
    override fun convertToEntityAttribute(dbData: Int?) = getEnumFromId<ReferralStepType>(dbData)
}

@Converter(autoApply = true)
class ReferralStepStatusConverter : AttributeConverter<ReferralStepStatus, Int> {
    override fun convertToDatabaseColumn(attribute: ReferralStepStatus?) = getIdFromEnum(attribute)
    override fun convertToEntityAttribute(dbData: Int?) = getEnumFromId<ReferralStepStatus>(dbData)
}

@Converter(autoApply = true)
class ClinicalStatusTypeConverter : AttributeConverter<ClinicalStatusType, Int> {
    override fun convertToDatabaseColumn(attribute: ClinicalStatusType?) = getIdFromEnum(attribute)
    override fun convertToEntityAttribute(dbData: Int?) = getEnumFromId<ClinicalStatusType>(dbData)
}

@Converter(autoApply = true)
class RiskStatusConverter : AttributeConverter<RiskStatus, Int> {
    override fun convertToDatabaseColumn(attribute: RiskStatus?) = getIdFromEnum(attribute)
    override fun convertToEntityAttribute(dbData: Int?) = getEnumFromId<RiskStatus>(dbData)
}

@Converter(autoApply = true)
class RiskFlagNameConverter : AttributeConverter<RiskFlagName, Int> {
    override fun convertToDatabaseColumn(attribute: RiskFlagName?) = getIdFromEnum(attribute)
    override fun convertToEntityAttribute(dbData: Int?) = getEnumFromId<RiskFlagName>(dbData)
}

@Converter(autoApply = true)
class FlagStatusConverter : AttributeConverter<FlagStatus, Int> {
    override fun convertToDatabaseColumn(attribute: FlagStatus?) = getIdFromEnum(attribute)
    override fun convertToEntityAttribute(dbData: Int?) = getEnumFromId<FlagStatus>(dbData)
}

@Converter(autoApply = true)
class PsychometricTestTypeConverter : AttributeConverter<PsychometricTestType, Int> {
    override fun convertToDatabaseColumn(attribute: PsychometricTestType?) = getIdFromEnum(attribute)
    override fun convertToEntityAttribute(dbData: Int?) = getEnumFromId<PsychometricTestType>(dbData)
}

@Converter(autoApply = true)
class AppointmentStatusConverter : AttributeConverter<AppointmentStatus, Int> {
    override fun convertToDatabaseColumn(attribute: AppointmentStatus?) = getIdFromEnum(attribute)
    override fun convertToEntityAttribute(dbData: Int?) = getEnumFromId<AppointmentStatus>(dbData)
}

@Converter(autoApply = true)
class FileStatusConverter : AttributeConverter<com.medicalsystem.backend.storage.domain.FileStatus, Int> {
    override fun convertToDatabaseColumn(attribute: com.medicalsystem.backend.storage.domain.FileStatus?) = getIdFromEnum(attribute)
    override fun convertToEntityAttribute(dbData: Int?) = getEnumFromId<com.medicalsystem.backend.storage.domain.FileStatus>(dbData)
}

@Converter(autoApply = true)
class FileCategoryConverter : AttributeConverter<com.medicalsystem.backend.storage.domain.FileCategory, Int> {
    override fun convertToDatabaseColumn(attribute: com.medicalsystem.backend.storage.domain.FileCategory?) = getIdFromEnum(attribute)
    override fun convertToEntityAttribute(dbData: Int?) = getEnumFromId<com.medicalsystem.backend.storage.domain.FileCategory>(dbData)
}
