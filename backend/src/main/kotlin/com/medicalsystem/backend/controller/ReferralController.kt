package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.CreateReferralDto
import com.medicalsystem.backend.dto.ReferralDto
import com.medicalsystem.backend.service.ReferralService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

import jakarta.validation.Valid

@RestController
@RequestMapping("/api/referrals")
class ReferralController(
    private val referralService: ReferralService
) {
    @GetMapping
    fun getAllReferrals(): List<ReferralDto> {
        return referralService.getAllReferrals()
    }

    @GetMapping("/{id}")
    fun getReferralById(@PathVariable id: Long): ReferralDto {
        return referralService.getReferralById(id)
    }

    @GetMapping("/{id}/tracking")
    fun getReferralTracking(@PathVariable id: Long): com.medicalsystem.backend.dto.ReferralTrackingDto {
        return referralService.getReferralTracking(id)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createReferral(@Valid @RequestBody dto: CreateReferralDto): ReferralDto {
        return referralService.createReferral(dto)
    }
}
