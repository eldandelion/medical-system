package com.medicalsystem.backend.repository

import com.medicalsystem.backend.mapper.ReferralMapper
import com.medicalsystem.backend.model.Referral
import org.springframework.stereotype.Repository
import java.util.Optional

import jakarta.persistence.EntityManager
import com.medicalsystem.backend.entity.HospitalEntity
import com.medicalsystem.backend.entity.DepartmentEntity
import com.medicalsystem.backend.entity.DoctorEntity
import com.medicalsystem.backend.entity.TrialAdminEntity
import com.medicalsystem.backend.entity.ReferralDestinationEntity

@Repository
class ReferralRepositoryAdapter(
    private val jpaRepository: ReferralJpaRepository,
    private val mapper: ReferralMapper,
    private val entityManager: EntityManager
) : ReferralRepository {

    override fun findAll(): List<Referral> {
        return jpaRepository.findAll().map { mapper.toModel(it) }
    }

    override fun findVisibleReferralsFor(user: com.medicalsystem.backend.model.User): List<Referral> {
        val criteria = com.medicalsystem.backend.model.ReferralVisibilityPolicy.getVisibilityCriteria(user)
        val spec = ReferralJpaSpecification.fromVisibilityCriteria(criteria)
        return jpaRepository.findAll(spec).map { mapper.toModel(it) }
    }

    override fun findById(id: Long): Optional<Referral> {
        return jpaRepository.findById(id).map { mapper.toModel(it) }
    }

    override fun save(referral: Referral): Referral {
        val entity = mapper.toEntity(referral)
        
        entity.destination = referral.destination?.let { dest ->
            when (dest) {
                is com.medicalsystem.backend.model.ReferralDestination.Submitted -> ReferralDestinationEntity(
                    hospital = entityManager.getReference(HospitalEntity::class.java, dest.hospitalId.value),
                    transferDate = dest.transferDate
                )
                is com.medicalsystem.backend.model.ReferralDestination.Triaged -> ReferralDestinationEntity(
                    hospital = entityManager.getReference(HospitalEntity::class.java, dest.hospitalId.value),
                    department = entityManager.getReference(DepartmentEntity::class.java, dest.departmentId.value),
                    doctor = entityManager.getReference(DoctorEntity::class.java, dest.doctorId.value),
                    triageAdmin = entityManager.getReference(TrialAdminEntity::class.java, dest.triageAdminId.value),
                    transferDate = dest.transferDate
                )
            }
        }
        
        val savedEntity = jpaRepository.save(entity)
        return mapper.toModel(savedEntity)
    }

    override fun deleteAll() {
        jpaRepository.deleteAll()
    }
}
