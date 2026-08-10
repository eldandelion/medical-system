package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.entity.PsychometricTestEntity
import com.medicalsystem.backend.entity.RiskFlagEntity
import com.medicalsystem.backend.entity.StudentHealthProfileEntity
import com.medicalsystem.backend.model.PsychometricTest
import com.medicalsystem.backend.model.RiskFlag
import com.medicalsystem.backend.model.Score
import com.medicalsystem.backend.model.StudentHealthProfile
import org.springframework.stereotype.Component

@Component
class StudentHealthProfileMapper {

    fun toModel(entity: StudentHealthProfileEntity): StudentHealthProfile {
        return StudentHealthProfile(
            id = entity.id,
            studentId = entity.studentId,
            scidDiagnosis = entity.scidDiagnosis,
            riskStatus = entity.riskStatus,
            riskFlags = entity.riskFlags.map { flagEntity ->
                RiskFlag(
                    id = flagEntity.id,
                    name = flagEntity.name,
                    status = flagEntity.status
                )
            }.toMutableList(),
            psychometricTests = entity.psychometricTests.map { testEntity ->
                PsychometricTest(
                    id = testEntity.id,
                    studentId = entity.studentId,
                    testType = testEntity.testType,
                    score = Score(points = testEntity.score, max = testEntity.maxScore),
                    testDate = testEntity.testDate,
                    sourceAssignmentId = testEntity.sourceAssignmentId
                )
            }.toMutableList()
        )
    }

    fun toEntity(model: StudentHealthProfile): StudentHealthProfileEntity {
        val entity = StudentHealthProfileEntity(
            id = model.id,
            studentId = model.studentId,
            scidDiagnosis = model.scidDiagnosis,
            riskStatus = model.riskStatus
        )
        
        entity.riskFlags = model.riskFlags.map { flagModel ->
            RiskFlagEntity(
                id = flagModel.id,
                name = flagModel.name,
                status = flagModel.status,
                healthProfile = entity
            )
        }.toMutableList()
        
        entity.psychometricTests = model.psychometricTests.map { testModel ->
            PsychometricTestEntity(
                id = testModel.id,
                testType = testModel.testType,
                score = testModel.score.points,
                maxScore = testModel.score.max,
                testDate = testModel.testDate,
                healthProfile = entity,
                sourceAssignmentId = testModel.sourceAssignmentId
            )
        }.toMutableList()
        
        return entity
    }
}
