package com.medicalsystem.backend.model

enum class RiskFlagName(val displayName: String) {
    SUICIDAL_IDEATION("自杀意念终身"),
    SUICIDE_ATTEMPT("自杀尝试终身"),
    SELF_HARM("自伤行为终身")
}
