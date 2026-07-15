package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.CreateReferralDto
import com.medicalsystem.backend.dto.ReferralDto
import com.medicalsystem.backend.security.CurrentUser
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.exception.ForbiddenException
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
    fun fetchActiveReferrals(@CurrentUser user: User?): List<ReferralDto> {
        return referralService.fetchActiveReferrals(user)
    }

    @GetMapping("/{id}")
    fun fetchReferralDetails(
        @PathVariable id: Long,
        @CurrentUser user: User?
    ): com.medicalsystem.backend.dto.ReferralDetailsDto {
        return referralService.fetchReferralDetails(id, user)
    }

    @GetMapping("/{id}/tracking")
    fun fetchReferralTracking(
        @PathVariable id: Long
    ): com.medicalsystem.backend.dto.ReferralTrackingDto {
        return referralService.fetchReferralTracking(id)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun initiateReferral(
        @Valid @RequestBody dto: com.medicalsystem.backend.dto.CreateReferralDto,
        @CurrentUser user: User?
    ): ReferralDto {
        if (user == null) throw ForbiddenException("Authorized user not found")
        return referralService.initiateReferral(dto, user)
    }

    @PostMapping("/{id}/approve")
    fun approveReferral(
        @PathVariable id: Long,
        @Valid @RequestBody dto: com.medicalsystem.backend.dto.ApproveReferralDto,
        @CurrentUser user: User?
    ): ReferralDto {
        if (user == null) throw ForbiddenException("Authorized user not found")
        return referralService.approveReferral(id, dto, user)
    }

    @PostMapping("/{id}/reject")
    fun rejectReferral(
        @PathVariable id: Long,
        @Valid @RequestBody dto: com.medicalsystem.backend.dto.RejectReferralDto,
        @CurrentUser user: User?
    ): ReferralDto {
        if (user == null) throw ForbiddenException("Authorized user not found")
        return referralService.rejectReferral(id, dto, user)
    }
    
    @PostMapping("/{id}/request-reassignment")
    fun requestReassignment(
        @PathVariable id: Long,
        @Valid @RequestBody dto: com.medicalsystem.backend.dto.RejectReferralDto,
        @CurrentUser user: User?
    ): ReferralDto {
        if (user == null) throw ForbiddenException("Authorized user not found")
        return referralService.requestReassignment(id, dto, user)
    }

    @PostMapping("/{id}/assign")
    fun assignDoctor(
        @PathVariable id: Long,
        @Valid @RequestBody dto: com.medicalsystem.backend.dto.AssignDoctorDto,
        @CurrentUser user: User?
    ): ReferralDto {
        if (user == null) throw ForbiddenException("Authorized user not found")
        return referralService.assignDoctor(id, dto, user)
    }

    @PostMapping("/{id}/schedule")
    fun scheduleAppointment(
        @PathVariable id: Long,
        @Valid @RequestBody dto: com.medicalsystem.backend.dto.ScheduleAppointmentDto,
        @CurrentUser user: User?
    ): ReferralDto {
        if (user == null) throw ForbiddenException("Authorized user not found")
        return referralService.scheduleAppointment(id, dto, user)
    }
}
