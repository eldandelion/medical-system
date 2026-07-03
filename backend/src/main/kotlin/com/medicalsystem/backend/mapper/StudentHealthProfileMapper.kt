package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.entity.PsychometricTestEntity
import com.medicalsystem.backend.entity.RiskFlagEntity
import com.medicalsystem.backend.entity.StudentHealthProfileEntity
import com.medicalsystem.backend.model.PsychometricTest
import com.medicalsystem.backend.model.RiskFlag
import com.medicalsystem.backend.model.StudentHealthProfile
import org.springframework.stereotype.Component

@Component
class StudentHealthProfileMapper {

    fun toModel(entity: StudentHealthProfileEntity): StudentHealthProfile {
        return StudentHealthProfile(
            id = entity.id,
            studentId = entity.studentId,
            riskStatus = entity.riskStatus,
            scidDiagnosis = entity.scidDiagnosis,
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
                    testResultName = testEntity.testResultName,
                    score = testEntity.score,
                    maxScore = testEntity.maxScore,
                    level = testEntity.level,
                    testDate = testEntity.testDate
                )
            }.toMutableList()
        )
    }

    fun toEntity(model: StudentHealthProfile): StudentHealthProfileEntity {
        val entity = StudentHealthProfileEntity(
            id = model.id,
            studentId = model.studentId,
            riskStatus = model.riskStatus,
            scidDiagnosis = model.scidDiagnosis
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
                testResultName = testModel.testResultName,
                score = testModel.score,
                maxScore = testModel.maxScore,
                level = testModel.level,
                testDate = testModel.testDate,
                healthProfile = entity
            )
        }.toMutableList()
        
        return entity
    }
}
