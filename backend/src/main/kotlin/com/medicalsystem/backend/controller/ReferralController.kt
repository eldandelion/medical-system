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
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")
        return referralService.fetchReferralDetails(id, currentUser)
    }

    @GetMapping("/{id}/tracking")
    fun fetchReferralTracking(
        @PathVariable id: Long,
        @CurrentUser user: User?
    ): com.medicalsystem.backend.dto.ReferralTrackingDto {
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")
        return referralService.fetchReferralTracking(id, currentUser)
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
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")
        return referralService.approveReferral(id, dto, currentUser)
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

    @PostMapping("/{id}/recall")
    fun recallReferral(
        @PathVariable id: Long,
        @CurrentUser user: User?
    ): ReferralDto {
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")
        return referralService.recallReferral(id, currentUser)
    }

    @PostMapping("/{id}/assign-doctor")
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

    @PostMapping("/{id}/acknowledge-feedback")
    fun acknowledgeFeedback(
        @PathVariable id: Long,
        @CurrentUser user: User?
    ): ReferralDto {
        if (user == null) throw ForbiddenException("Authorized user not found")
        return referralService.acknowledgeFeedback(id, user)
    }

    @PostMapping("/{id}/cancel")
    fun cancelReferral(
        @PathVariable id: Long,
        @RequestBody(required = false) dto: com.medicalsystem.backend.dto.RejectReferralDto?,
        @CurrentUser user: User?
    ): ReferralDto {
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")
        return referralService.cancelReferralByAdmin(id, dto, currentUser)
    }
}
