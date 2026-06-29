package com.medicalsystem.backend.model

enum class TestResultName(val displayName: String) {
    PHQ_9("PHQ-9 (抑郁)"),
    GAD_7("GAD-7 (焦虑)"),
    BDI_II("BDI-II (贝克抑郁)"),
    BAI("BAI (贝克焦虑)"),
    PSQI("PSQI (睡眠质量)"),
    ISS("ISS (失眠严重程度)"),
    ESS("ESS (白天嗜睡情况)")
}
