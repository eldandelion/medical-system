package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.CreateReferralDto
import com.medicalsystem.backend.dto.ReferralDto
import com.medicalsystem.backend.service.ReferralService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createReferral(@RequestBody dto: CreateReferralDto): ReferralDto {
        return referralService.createReferral(dto)
    }
}
