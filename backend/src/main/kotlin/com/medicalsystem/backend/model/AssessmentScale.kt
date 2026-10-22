package com.medicalsystem.backend.model

data class AssessmentOption(
    val value: Any,
    val label: String,
    val hasTextInput: Boolean = false,
    val textInputPlaceholder: String? = null,
    val textInputLabel: String? = null
)

data class AssessmentOptionGroup(
    val name: String,
    val options: List<AssessmentOption> = emptyList()
)

data class AssessmentQuestion(
    val code: String,
    val text: String,
    val orderNum: Int,
    val type: String = "single_choice",
    val field: String? = null,
    val placeholder: String? = null,
    val min: Double? = null,
    val max: Double? = null,
    val step: Double? = null,
    val unit: String? = null,
    val minLabel: String? = null,
    val maxLabel: String? = null,
    val icon: String? = null,
    val zeroOptionLabel: String? = null,
    val optionGroup: AssessmentOptionGroup? = null,
    val customOptions: List<AssessmentOption>? = null,
    val sectionCode: String? = null,
    val sectionTitle: String? = null
) {
    val effectiveOptions: List<AssessmentOption>
        get() = customOptions?.takeIf { it.isNotEmpty() } ?: optionGroup?.options ?: emptyList()
}

data class AssessmentSection(
    val code: String,
    val title: String,
    val subtitle: String? = null,
    val description: String? = null,
    val orderNum: Int,
    val questionCount: Int = 0,
    val questions: List<AssessmentQuestion> = emptyList()
)

data class ScaleIntroItem(
    val icon: String = "assignment",
    val title: String,
    val description: String
)

data class AssessmentScale(
    val batteryCode: String,
    val title: String,
    val subtitle: String? = null,
    val description: String? = null,
    val duration: String,
    val estimatedMinutes: Int = 45,
    val instructions: String? = null,
    val introItems: List<ScaleIntroItem> = emptyList(),
    val orderNum: Int,
    val sections: List<AssessmentSection> = emptyList()
) {
    val code: String
        @com.fasterxml.jackson.annotation.JsonProperty("code")
        get() = batteryCode

    val totalQuestions: Int
        get() = sections.sumOf { it.questions.size }

    val allQuestionCodes: Set<String>
        get() = sections.flatMap { it.questions }.map { it.code }.toSet()

    val questions: List<AssessmentQuestion>
        get() = sections.flatMap { it.questions }
}
