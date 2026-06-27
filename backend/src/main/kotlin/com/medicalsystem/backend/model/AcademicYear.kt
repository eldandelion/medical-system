package com.medicalsystem.backend.model

import com.fasterxml.jackson.annotation.JsonValue

enum class AcademicYear(val value: String) {
    NEW_STUDENT("新生"),
    FRESHMAN("大一"),
    SOPHOMORE("大二"),
    JUNIOR("大三"),
    SENIOR("大四"),
    FIFTH_YEAR("大五"),
    GRADUATED("毕业");

    @JsonValue
    fun toValue(): String = value
}
