package com.medicalsystem.backend.converter

import com.medicalsystem.backend.model.AppointmentStatus
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class EnumConvertersTest {

    @Test
    fun `AppointmentStatusConverter should convert to and from database column`() {
        val converter = AppointmentStatusConverter()
        
        assertEquals(1, converter.convertToDatabaseColumn(AppointmentStatus.SCHEDULED))
        assertEquals(2, converter.convertToDatabaseColumn(AppointmentStatus.COMPLETED))
        assertEquals(3, converter.convertToDatabaseColumn(AppointmentStatus.CANCELLED))
        assertEquals(null, converter.convertToDatabaseColumn(null))
        
        assertEquals(AppointmentStatus.SCHEDULED, converter.convertToEntityAttribute(1))
        assertEquals(AppointmentStatus.COMPLETED, converter.convertToEntityAttribute(2))
        assertEquals(AppointmentStatus.CANCELLED, converter.convertToEntityAttribute(3))
        assertEquals(null, converter.convertToEntityAttribute(null))
        assertEquals(null, converter.convertToEntityAttribute(99))
    }
}
