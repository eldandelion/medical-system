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
    fun fetchActiveReferrals(@RequestHeader(value = "Authorization", required = false) token: String?): List<ReferralDto> {
        return referralService.fetchActiveReferrals(token)
    }

    @GetMapping("/{id}")
    fun fetchReferralDetails(
        @PathVariable id: Long,
        @RequestHeader(value = "Authorization", required = false) token: String?
    ): com.medicalsystem.backend.dto.ReferralDetailsDto {
        return referralService.fetchReferralDetails(id, token)
    }

    @GetMapping("/{id}/tracking")
    fun fetchReferralTracking(
        @PathVariable id: Long,
        @RequestHeader(value = "Authorization", required = false) token: String?
    ): com.medicalsystem.backend.dto.ReferralTrackingDto {
        return referralService.fetchReferralTracking(id)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun initiateReferral(
        @Valid @RequestBody dto: com.medicalsystem.backend.dto.CreateReferralDto,
        @RequestHeader(value = "Authorization", required = false) token: String?
    ): ReferralDto {
        return referralService.initiateReferral(dto, token)
    }

    @PostMapping("/{id}/approve")
    fun approveReferral(
        @PathVariable id: Long,
        @RequestHeader(value = "Authorization", required = false) token: String?
    ): ReferralDto {
        return referralService.approveReferral(id, token)
    }

    @PostMapping("/{id}/reject")
    fun rejectReferral(
        @PathVariable id: Long,
        @Valid @RequestBody dto: com.medicalsystem.backend.dto.RejectReferralDto,
        @RequestHeader(value = "Authorization", required = false) token: String?
    ): ReferralDto {
        return referralService.rejectReferral(id, dto, token)
    }
    @PostMapping("/{id}/request-reassignment")
    fun requestReassignment(
        @PathVariable id: Long,
        @Valid @RequestBody dto: com.medicalsystem.backend.dto.RejectReferralDto,
        @RequestHeader(value = "Authorization", required = false) token: String?
    ): ReferralDto {
        return referralService.requestReassignment(id, dto, token)
    }

    @PostMapping("/{id}/assign")
    fun assignDoctor(
        @PathVariable id: Long,
        @Valid @RequestBody dto: com.medicalsystem.backend.dto.AssignDoctorDto,
        @RequestHeader(value = "Authorization", required = false) token: String?
    ): ReferralDto {
        return referralService.assignDoctor(id, dto, token)
    }
}
