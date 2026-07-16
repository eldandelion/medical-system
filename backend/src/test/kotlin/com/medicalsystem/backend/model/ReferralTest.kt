package com.medicalsystem.backend.model

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class ReferralTest {

    @Test
    fun `createDraft adds INITIATION step for draft`() {
        val referral = ReferralFactory.createDraft(
            studentId = 1L,
            title = "Test",
            reason = "Test reason",
            riskLevel = RiskStatus.LOW,
            referredById = 2L
        )

        assertEquals(ReferralStatus.DRAFT, referral.status)
        assertEquals(1, referral.steps.size)
        val step = referral.steps[0]
        assertEquals(ReferralStepType.INITIATION, step.type)
        assertEquals(ReferralStepStatus.ACTIVE, step.status)
        assertEquals(2L, step.actorId)
    }

    @Test
    fun `submit transitions to AWAITING_APPROVAL and adds REVIEW step for regular user`() {
        val referral = ReferralFactory.createDraft(
            studentId = 1L,
            title = "Test",
            reason = "Test reason",
            riskLevel = RiskStatus.LOW,
            referredById = 2L
        )
        referral.submit(UserRole.TEACHER, 2L)

        assertEquals(ReferralStatus.AWAITING_APPROVAL, referral.status)
        assertEquals(2, referral.steps.size)
        
        val step1 = referral.steps[0]
        assertEquals(ReferralStepType.INITIATION, step1.type)
        assertEquals(ReferralStepStatus.COMPLETED, step1.status)
        
        val step2 = referral.steps[1]
        assertEquals(ReferralStepType.REVIEW, step2.type)
        assertEquals(ReferralStepStatus.ACTIVE, step2.status)
    }

    @Test
    fun `submit transitions to AWAITING_APPROVAL and adds REVIEW step for head counsellor`() {
        val referral = ReferralFactory.createDraft(
            studentId = 1L,
            title = "Test",
            reason = "Test reason",
            riskLevel = RiskStatus.LOW,
            referredById = 2L
        )
        referral.submit(UserRole.HEAD_COUNSELLOR, 2L)

        assertEquals(ReferralStatus.AWAITING_APPROVAL, referral.status)
        assertEquals(2, referral.steps.size)
        
        val step1 = referral.steps[0]
        assertEquals(ReferralStepType.INITIATION, step1.type)
        assertEquals(ReferralStepStatus.COMPLETED, step1.status)
        
        val step2 = referral.steps[1]
        assertEquals(ReferralStepType.REVIEW, step2.type)
        assertEquals(ReferralStepStatus.ACTIVE, step2.status)
    }

    @Test
    fun `transition marks previous active step as completed and adds new step`() {
        val referral = ReferralFactory.createDraft(
            studentId = 1L,
            title = "Test",
            reason = "Test reason",
            riskLevel = RiskStatus.LOW,
            referredById = 2L
        )
        referral.submit(UserRole.TEACHER, 2L)

        // Assign a mock destination before transitioning to AWAITING_TRIAGE
        referral.destination = ReferralDestination.Submitted(
            hospitalId = HospitalId(1L),
            transferDate = null
        )
        referral.transition(ReferralStatus.AWAITING_TRIAGE)

        assertEquals(ReferralStatus.AWAITING_TRIAGE, referral.status)
        assertEquals(3, referral.steps.size)
        
        assertEquals(ReferralStepStatus.COMPLETED, referral.steps[0].status)
        assertEquals(ReferralStepStatus.COMPLETED, referral.steps[1].status)
        
        val step3 = referral.steps[2]
        assertEquals(ReferralStepType.TRIAGE, step3.type)
        assertEquals(ReferralStepStatus.ACTIVE, step3.status)
    }

    @Test
    fun `transition to NEEDS_REASSIGNMENT marks previous step as ISSUE and saves reason`() {
        val referral = ReferralFactory.createDraft(
            studentId = 1L,
            title = "Test",
            reason = "Test reason",
            riskLevel = RiskStatus.LOW,
            referredById = 2L
        )
        referral.submit(UserRole.TEACHER, 2L)

        // Assign a mock destination before transitioning to AWAITING_TRIAGE
        referral.destination = ReferralDestination.Submitted(
            hospitalId = HospitalId(1L),
            transferDate = null
        )
        referral.transition(ReferralStatus.AWAITING_TRIAGE)
        
        // Mock Triaged destination before moving to scheduling
        referral.destination = ReferralDestination.Triaged(
            hospitalId = HospitalId(1L),
            triageAdminId = TriageAdminId(1L),
            departmentId = DepartmentId(1L),
            doctorId = DoctorId(1L),
            transferDate = null
        )
        referral.transition(ReferralStatus.WAITING_FOR_SCHEDULING)
        
        // Doctor requests reassignment
        referral.transition(ReferralStatus.NEEDS_REASSIGNMENT, actorId = 3L, reason = "Doctor needs more info")

        assertEquals(ReferralStatus.NEEDS_REASSIGNMENT, referral.status)
        
        // Active step before rejection was SCHEDULING (step 4)
        val schedulingStep = referral.steps.find { it.type == ReferralStepType.SCHEDULING }!!
        assertEquals(ReferralStepStatus.ISSUE, schedulingStep.status)
        assertEquals("Doctor needs more info", schedulingStep.reason)
    }

    @Test
    fun `getAllowedActions for TRIAL_ADMIN returns REASSIGN_DOCTOR when NEEDS_REASSIGNMENT`() {
        val referral = ReferralFactory.createDraft(
            studentId = 1L,
            title = "Test",
            reason = "Test reason",
            riskLevel = RiskStatus.LOW,
            referredById = 2L
        )
        referral.submit(UserRole.TEACHER, 2L)

        // Assign a mock destination before transitioning to AWAITING_TRIAGE
        referral.destination = ReferralDestination.Submitted(
            hospitalId = HospitalId(1L),
            transferDate = null
        )
        referral.transition(ReferralStatus.AWAITING_TRIAGE)
        
        // Mock Triaged destination before moving to scheduling
        referral.destination = ReferralDestination.Triaged(
            hospitalId = HospitalId(1L),
            triageAdminId = TriageAdminId(1L),
            departmentId = DepartmentId(1L),
            doctorId = DoctorId(1L),
            transferDate = null
        )
        referral.transition(ReferralStatus.WAITING_FOR_SCHEDULING)
        referral.transition(ReferralStatus.NEEDS_REASSIGNMENT, actorId = 3L, reason = "Doctor needs more info")

        val trialAdmin = TrialAdmin(id = 4L, name = "Admin", email = com.medicalsystem.backend.model.EmailAddress("admin@test.com"))
        
        val actions = referral.getAllowedActions(trialAdmin)
        assertTrue(actions.contains(ReferralAction.REASSIGN_DOCTOR))
        assertTrue(actions.contains(ReferralAction.REJECT_REFERRAL))
        assertFalse(actions.contains(ReferralAction.ASSIGN_DOCTOR))
    }

    @Test
    fun `scheduleAppointment creates Appointment, transitions state and emits event`() {
        val referral = ReferralFactory.createDraft(
            studentId = 100L,
            title = "Test",
            reason = "Test reason",
            riskLevel = RiskStatus.LOW,
            referredById = 2L
        )
        // Transition to WAITING_FOR_SCHEDULING to make it valid for scheduling
        referral.status = ReferralStatus.WAITING_FOR_SCHEDULING
        
        // Ensure ID is set for event generation
        val referralSpy = Referral(
            id = 500L,
            studentId = referral.studentId,
            type = referral.type,
            date = referral.date,
            title = referral.title,
            description = referral.description,
            riskLevel = referral.riskLevel,
            status = referral.status,
            referredById = referral.referredById,
            steps = referral.steps
        )
        
        referralSpy.destination = com.medicalsystem.backend.model.ReferralDestination.Triaged(
            hospitalId = com.medicalsystem.backend.model.HospitalId(1L),
            departmentId = com.medicalsystem.backend.model.DepartmentId(1L),
            doctorId = com.medicalsystem.backend.model.DoctorId(3L),
            triageAdminId = com.medicalsystem.backend.model.TriageAdminId(1L),
            transferDate = null
        )

        val appointmentTime = java.time.LocalDateTime.now().plusDays(2)
        referralSpy.scheduleAppointment(doctorId = 3L, time = appointmentTime, actorId = 3L)

        // Verify state transition
        assertEquals(ReferralStatus.WAITING_FOR_APPOINTMENT, referralSpy.status)
        
        // Verify Appointment created
        assertNotNull(referralSpy.appointment)
        assertEquals(3L, referralSpy.appointment?.doctorId)
        assertEquals(appointmentTime.toInstant(java.time.ZoneOffset.UTC), referralSpy.appointment?.appointmentTime)
        assertEquals(AppointmentStatus.SCHEDULED, referralSpy.appointment?.status)
        
        // Verify Step created (EVALUATION step should become ACTIVE because WAITING_FOR_APPOINTMENT requires EVALUATION step type)
        val activeStep = referralSpy.steps.find { it.status == ReferralStepStatus.ACTIVE }
        assertNotNull(activeStep)
        assertEquals(ReferralStepType.EVALUATION, activeStep?.type)

        // Verify Event Emitted
        val events = referralSpy.getDomainEvents()
        val scheduledEvent = events.filterIsInstance<com.medicalsystem.backend.event.AppointmentScheduledEvent>().firstOrNull()
        assertNotNull(scheduledEvent)
        assertEquals(500L, scheduledEvent?.referralId)
        assertEquals(100L, scheduledEvent?.studentId)
        assertEquals(3L, scheduledEvent?.doctorId)
        assertEquals(appointmentTime, scheduledEvent?.appointmentTime)
    }

    @Test
    fun `approve sets destination and transitions to AWAITING_TRIAGE`() {
        val referral = ReferralFactory.createDraft(
            studentId = 1L,
            title = "Test",
            reason = "Test reason",
            riskLevel = RiskStatus.LOW,
            referredById = 2L
        )
        referral.submit(UserRole.TEACHER, 2L)

        referral.approve(hospitalId = HospitalId(1L), actorId = 3L)

        assertEquals(ReferralStatus.AWAITING_TRIAGE, referral.status)
        assertNotNull(referral.destination)
        assertTrue(referral.destination is ReferralDestination.Submitted)
        assertEquals(1L, (referral.destination as ReferralDestination.Submitted).hospitalId.value)
    }

    @Test
    fun `approve throws ValidationException when not in AWAITING_APPROVAL status`() {
        val referral = ReferralFactory.createDraft(
            studentId = 1L,
            title = "Test",
            reason = "Test reason",
            riskLevel = RiskStatus.LOW,
            referredById = 2L
        )

        val exception = assertThrows(com.medicalsystem.backend.exception.ValidationException::class.java) {
            referral.approve(hospitalId = HospitalId(1L), actorId = 3L)
        }
        assertEquals("Only referrals awaiting approval can be approved", exception.message)
    }

    @Test
    fun `transition throws ValidationException when transitioning to AWAITING_TRIAGE without a hospital destination`() {
        val referral = ReferralFactory.createDraft(
            studentId = 1L,
            title = "Test",
            reason = "Test reason",
            riskLevel = RiskStatus.LOW,
            referredById = 2L
        )
        referral.submit(UserRole.TEACHER, 2L)

        val exception = assertThrows(com.medicalsystem.backend.exception.ValidationException::class.java) {
            referral.transition(ReferralStatus.AWAITING_TRIAGE)
        }
        assertEquals("Referral must have an assigned hospital destination before moving past approval", exception.message)
    }
}
