package com.medicalsystem.backend.model

data class AssessmentOption(
    val value: Int,
    val label: String
)

data class AssessmentOptionGroup(
    val name: String,
    val options: List<AssessmentOption> = emptyList()
)

data class AssessmentQuestion(
    val code: String,
    val text: String,
    val orderNum: Int,
    val optionGroup: AssessmentOptionGroup? = null,
    val customOptions: List<AssessmentOption>? = null
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
    val questions: List<AssessmentQuestion> = emptyList()
)

data class AssessmentScale(
    val batteryCode: String,
    val title: String,
    val subtitle: String? = null,
    val description: String? = null,
    val duration: String,
    val orderNum: Int,
    val sections: List<AssessmentSection> = emptyList()
) {
    val totalQuestions: Int
        get() = sections.sumOf { it.questions.size }

    val allQuestionCodes: Set<String>
        get() = sections.flatMap { it.questions }.map { it.code }.toSet()
}
