package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.AssessmentDispatch

interface AssessmentDispatchRepository {
    fun save(dispatch: AssessmentDispatch): AssessmentDispatch
    fun findById(id: Long): AssessmentDispatch?
    fun findAll(): List<AssessmentDispatch>
}
