package com.medicalsystem.backend.repository

import com.medicalsystem.backend.mapper.ReferralMapper
import com.medicalsystem.backend.model.Referral
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
class ReferralRepositoryAdapter(
    private val jpaRepository: ReferralJpaRepository,
    private val mapper: ReferralMapper
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
        val savedEntity = jpaRepository.save(entity)
        return mapper.toModel(savedEntity)
    }

    override fun deleteAll() {
        jpaRepository.deleteAll()
    }
}
