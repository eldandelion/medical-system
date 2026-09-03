package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.entity.CollegeEntity
import com.medicalsystem.backend.entity.MajorEntity
import com.medicalsystem.backend.entity.SchoolDepartmentEntity
import com.medicalsystem.backend.entity.SchoolEntity
import com.medicalsystem.backend.event.CollegeStatusChangedEvent
import com.medicalsystem.backend.event.DomainEventPublisher
import com.medicalsystem.backend.event.SchoolStatusChangedEvent
import com.medicalsystem.backend.exception.ConflictException
import com.medicalsystem.backend.exception.NotFoundException
import com.medicalsystem.backend.model.ReferenceCategory
import com.medicalsystem.backend.model.ReferenceDataStatus
import com.medicalsystem.backend.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class AcademicReferenceService(
    private val collegeJpaRepository: CollegeJpaRepository,
    private val majorJpaRepository: MajorJpaRepository,
    private val schoolDepartmentJpaRepository: SchoolDepartmentJpaRepository,
    private val schoolJpaRepository: SchoolJpaRepository,
    private val teacherJpaRepository: TeacherJpaRepository,
    private val studentJpaRepository: StudentJpaRepository,
    private val headCounsellorJpaRepository: HeadCounsellorJpaRepository,
    private val dependencyAnalyzer: ReferenceDependencyAnalyzer,
    private val eventPublisher: DomainEventPublisher
) {

    // === Colleges ===

    @Transactional(readOnly = true)
    fun listColleges(query: String?, includeDeprecated: Boolean): List<CollegeDto> {
        val colleges = if (includeDeprecated) {
            collegeJpaRepository.findAllByOrderByNameAsc()
        } else {
            collegeJpaRepository.findByStatusOrderByNameAsc(ReferenceDataStatus.ACTIVE)
        }

        val filtered = if (!query.isNullOrBlank()) {
            colleges.filter { it.name.contains(query.trim(), ignoreCase = true) }
        } else {
            colleges
        }

        return filtered.map { college ->
            val cId = college.id ?: 0L
            CollegeDto(
                id = cId,
                name = college.name,
                status = college.status,
                majorCount = majorJpaRepository.countByCollegeId(cId),
                teacherCount = teacherJpaRepository.countByCollegeId(cId)
            )
        }
    }

    fun createCollege(req: SaveCollegeRequest): CollegeDto {
        val trimmedName = req.name.trim()
        if (collegeJpaRepository.findByName(trimmedName) != null) {
            throw ConflictException("College with name '$trimmedName' already exists")
        }
        val entity = CollegeEntity(name = trimmedName, status = ReferenceDataStatus.ACTIVE)
        val saved = collegeJpaRepository.save(entity)
        return CollegeDto(id = saved.id ?: 0L, name = saved.name, status = saved.status)
    }

    fun updateCollege(id: Long, req: SaveCollegeRequest): CollegeDto {
        val entity = collegeJpaRepository.findById(id).orElseThrow { NotFoundException("College not found with id: $id") }
        val trimmedName = req.name.trim()
        val existing = collegeJpaRepository.findByName(trimmedName)
        if (existing != null && existing.id != id) {
            throw ConflictException("Another college with name '$trimmedName' already exists")
        }
        entity.name = trimmedName
        val saved = collegeJpaRepository.save(entity)
        return CollegeDto(
            id = saved.id ?: 0L,
            name = saved.name,
            status = saved.status,
            majorCount = majorJpaRepository.countByCollegeId(id),
            teacherCount = teacherJpaRepository.countByCollegeId(id)
        )
    }

    fun setCollegeStatus(id: Long, newStatus: ReferenceDataStatus): CollegeDto {
        val entity = collegeJpaRepository.findById(id).orElseThrow { NotFoundException("College not found with id: $id") }
        entity.status = newStatus
        val saved = collegeJpaRepository.save(entity)
        eventPublisher.publish(CollegeStatusChangedEvent(id, newStatus))
        return CollegeDto(
            id = saved.id ?: 0L,
            name = saved.name,
            status = saved.status,
            majorCount = majorJpaRepository.countByCollegeId(id),
            teacherCount = teacherJpaRepository.countByCollegeId(id)
        )
    }

    fun deleteCollege(id: Long) {
        val check = dependencyAnalyzer.checkDependencies(ReferenceCategory.COLLEGE, id)
        if (!check.canHardDelete) {
            throw ConflictException("Cannot delete college '$id' because it is referenced in the system")
        }
        val entity = collegeJpaRepository.findById(id).orElseThrow { NotFoundException("College not found with id: $id") }
        collegeJpaRepository.delete(entity)
    }

    // === Majors ===

    @Transactional(readOnly = true)
    fun listMajors(query: String?, collegeId: Long?, includeDeprecated: Boolean): List<MajorDto> {
        val majors = if (collegeId != null) {
            if (includeDeprecated) majorJpaRepository.findByCollegeId(collegeId)
            else majorJpaRepository.findByCollegeIdAndStatus(collegeId, ReferenceDataStatus.ACTIVE)
        } else {
            if (includeDeprecated) majorJpaRepository.findAllByOrderByNameAsc()
            else majorJpaRepository.findByStatusOrderByNameAsc(ReferenceDataStatus.ACTIVE)
        }

        val filtered = if (!query.isNullOrBlank()) {
            majors.filter { it.name.contains(query.trim(), ignoreCase = true) || it.college.name.contains(query.trim(), ignoreCase = true) }
        } else {
            majors
        }

        return filtered.map { major ->
            val mId = major.id ?: 0L
            MajorDto(
                id = mId,
                name = major.name,
                collegeId = major.college.id ?: 0L,
                collegeName = major.college.name,
                status = major.status,
                studentCount = studentJpaRepository.countByMajorId(mId)
            )
        }
    }

    fun createMajor(req: SaveMajorRequest): MajorDto {
        val trimmedName = req.name.trim()
        val college = collegeJpaRepository.findById(req.collegeId).orElseThrow { NotFoundException("College not found with id: ${req.collegeId}") }
        if (college.status == ReferenceDataStatus.DEPRECATED) {
            throw ConflictException("Cannot add major under a deprecated college")
        }
        if (majorJpaRepository.findByName(trimmedName) != null) {
            throw ConflictException("Major with name '$trimmedName' already exists")
        }
        val entity = MajorEntity(name = trimmedName, college = college, status = ReferenceDataStatus.ACTIVE)
        val saved = majorJpaRepository.save(entity)
        return MajorDto(
            id = saved.id ?: 0L,
            name = saved.name,
            collegeId = college.id ?: 0L,
            collegeName = college.name,
            status = saved.status
        )
    }

    fun updateMajor(id: Long, req: SaveMajorRequest): MajorDto {
        val entity = majorJpaRepository.findById(id).orElseThrow { NotFoundException("Major not found with id: $id") }
        val trimmedName = req.name.trim()
        val existing = majorJpaRepository.findByName(trimmedName)
        if (existing != null && existing.id != id) {
            throw ConflictException("Another major with name '$trimmedName' already exists")
        }
        val college = collegeJpaRepository.findById(req.collegeId).orElseThrow { NotFoundException("College not found with id: ${req.collegeId}") }
        entity.name = trimmedName
        entity.college = college
        val saved = majorJpaRepository.save(entity)
        return MajorDto(
            id = saved.id ?: 0L,
            name = saved.name,
            collegeId = college.id ?: 0L,
            collegeName = college.name,
            status = saved.status,
            studentCount = studentJpaRepository.countByMajorId(id)
        )
    }

    fun setMajorStatus(id: Long, newStatus: ReferenceDataStatus): MajorDto {
        val entity = majorJpaRepository.findById(id).orElseThrow { NotFoundException("Major not found with id: $id") }
        entity.status = newStatus
        val saved = majorJpaRepository.save(entity)
        return MajorDto(
            id = saved.id ?: 0L,
            name = saved.name,
            collegeId = entity.college.id ?: 0L,
            collegeName = entity.college.name,
            status = saved.status,
            studentCount = studentJpaRepository.countByMajorId(id)
        )
    }

    fun deleteMajor(id: Long) {
        val check = dependencyAnalyzer.checkDependencies(ReferenceCategory.MAJOR, id)
        if (!check.canHardDelete) {
            throw ConflictException("Cannot delete major '$id' because it is referenced in the system")
        }
        val entity = majorJpaRepository.findById(id).orElseThrow { NotFoundException("Major not found with id: $id") }
        majorJpaRepository.delete(entity)
    }

    // === School Departments ===

    @Transactional(readOnly = true)
    fun listSchoolDepartments(query: String?, includeDeprecated: Boolean): List<SchoolDepartmentDto> {
        val depts = if (includeDeprecated) {
            schoolDepartmentJpaRepository.findAllByOrderByNameAsc()
        } else {
            schoolDepartmentJpaRepository.findByStatusOrderByNameAsc(ReferenceDataStatus.ACTIVE)
        }

        val filtered = if (!query.isNullOrBlank()) {
            depts.filter { it.name.contains(query.trim(), ignoreCase = true) }
        } else {
            depts
        }

        return filtered.map { dept ->
            SchoolDepartmentDto(
                id = dept.id,
                name = dept.name,
                schoolId = dept.school.id,
                schoolName = dept.school.name,
                status = dept.status,
                staffCount = headCounsellorJpaRepository.countByDepartmentId(dept.id)
            )
        }
    }

    fun createSchoolDepartment(req: SaveSchoolDepartmentRequest): SchoolDepartmentDto {
        val trimmedName = req.name.trim()
        if (schoolDepartmentJpaRepository.findByName(trimmedName) != null) {
            throw ConflictException("School department with name '$trimmedName' already exists")
        }
        val school = if (req.schoolId != null) {
            schoolJpaRepository.findById(req.schoolId).orElseThrow { NotFoundException("School not found with id: ${req.schoolId}") }
        } else {
            schoolJpaRepository.findAll().firstOrNull()
                ?: throw NotFoundException("No default school found in system")
        }
        if (school.status == ReferenceDataStatus.DEPRECATED) {
            throw ConflictException("Cannot create school department under deprecated school: ${school.name}")
        }
        val entity = SchoolDepartmentEntity(name = trimmedName, school = school, status = ReferenceDataStatus.ACTIVE)
        val saved = schoolDepartmentJpaRepository.save(entity)
        return SchoolDepartmentDto(
            id = saved.id,
            name = saved.name,
            schoolId = school.id,
            schoolName = school.name,
            status = saved.status
        )
    }

    fun updateSchoolDepartment(id: Long, req: SaveSchoolDepartmentRequest): SchoolDepartmentDto {
        val entity = schoolDepartmentJpaRepository.findById(id).orElseThrow { NotFoundException("School department not found with id: $id") }
        val trimmedName = req.name.trim()
        val existing = schoolDepartmentJpaRepository.findByName(trimmedName)
        if (existing != null && existing.id != id) {
            throw ConflictException("Another school department with name '$trimmedName' already exists")
        }
        if (req.schoolId != null) {
            val school = schoolJpaRepository.findById(req.schoolId).orElseThrow { NotFoundException("School not found with id: ${req.schoolId}") }
            if (school.status == ReferenceDataStatus.DEPRECATED) {
                throw ConflictException("Cannot move school department under deprecated school: ${school.name}")
            }
            entity.school = school
        }
        entity.name = trimmedName
        val saved = schoolDepartmentJpaRepository.save(entity)
        return SchoolDepartmentDto(
            id = saved.id,
            name = saved.name,
            schoolId = saved.school.id,
            schoolName = saved.school.name,
            status = saved.status,
            staffCount = headCounsellorJpaRepository.countByDepartmentId(id)
        )
    }

    fun setSchoolDepartmentStatus(id: Long, newStatus: ReferenceDataStatus): SchoolDepartmentDto {
        val entity = schoolDepartmentJpaRepository.findById(id).orElseThrow { NotFoundException("School department not found with id: $id") }
        entity.status = newStatus
        val saved = schoolDepartmentJpaRepository.save(entity)
        return SchoolDepartmentDto(
            id = saved.id,
            name = saved.name,
            schoolId = saved.school.id,
            schoolName = saved.school.name,
            status = saved.status,
            staffCount = headCounsellorJpaRepository.countByDepartmentId(id)
        )
    }

    fun deleteSchoolDepartment(id: Long) {
        val check = dependencyAnalyzer.checkDependencies(ReferenceCategory.SCHOOL_DEPARTMENT, id)
        if (!check.canHardDelete) {
            throw ConflictException("Cannot delete school department '$id' because it is referenced in the system")
        }
        val entity = schoolDepartmentJpaRepository.findById(id).orElseThrow { NotFoundException("School department not found with id: $id") }
        schoolDepartmentJpaRepository.delete(entity)
    }

    // === Schools ===

    @Transactional(readOnly = true)
    fun listSchools(query: String?, includeDeprecated: Boolean): List<SchoolDto> {
        val schools = if (includeDeprecated) {
            schoolJpaRepository.findAllByOrderByNameAsc()
        } else {
            schoolJpaRepository.findByStatusOrderByNameAsc(ReferenceDataStatus.ACTIVE)
        }

        val filtered = if (!query.isNullOrBlank()) {
            schools.filter { it.name.contains(query.trim(), ignoreCase = true) }
        } else {
            schools
        }

        return filtered.map { school ->
            val sId = school.id
            SchoolDto(
                id = sId,
                name = school.name,
                status = school.status,
                departmentCount = schoolDepartmentJpaRepository.countBySchoolId(sId),
                studentCount = studentJpaRepository.countByDemographicsSchoolId(sId)
            )
        }
    }

    fun createSchool(req: SaveSimpleReferenceRequest): SchoolDto {
        val trimmedName = req.name.trim()
        if (schoolJpaRepository.findByName(trimmedName).isPresent) {
            throw ConflictException("School with name '$trimmedName' already exists")
        }
        val entity = SchoolEntity(name = trimmedName, status = ReferenceDataStatus.ACTIVE)
        val saved = schoolJpaRepository.save(entity)
        return SchoolDto(id = saved.id, name = saved.name, status = saved.status)
    }

    fun updateSchool(id: Long, req: SaveSimpleReferenceRequest): SchoolDto {
        val entity = schoolJpaRepository.findById(id).orElseThrow { NotFoundException("School not found with id: $id") }
        val trimmedName = req.name.trim()
        val existing = schoolJpaRepository.findByName(trimmedName).orElse(null)
        if (existing != null && existing.id != id) {
            throw ConflictException("Another school with name '$trimmedName' already exists")
        }
        entity.name = trimmedName
        val saved = schoolJpaRepository.save(entity)
        return SchoolDto(
            id = saved.id,
            name = saved.name,
            status = saved.status,
            departmentCount = schoolDepartmentJpaRepository.countBySchoolId(id),
            studentCount = studentJpaRepository.countByDemographicsSchoolId(id)
        )
    }

    fun setSchoolStatus(id: Long, newStatus: ReferenceDataStatus): SchoolDto {
        val entity = schoolJpaRepository.findById(id).orElseThrow { NotFoundException("School not found with id: $id") }
        entity.status = newStatus
        val saved = schoolJpaRepository.save(entity)
        eventPublisher.publish(SchoolStatusChangedEvent(id, newStatus))
        return SchoolDto(
            id = saved.id,
            name = saved.name,
            status = saved.status,
            departmentCount = schoolDepartmentJpaRepository.countBySchoolId(id),
            studentCount = studentJpaRepository.countByDemographicsSchoolId(id)
        )
    }

    fun deleteSchool(id: Long) {
        val check = dependencyAnalyzer.checkDependencies(ReferenceCategory.SCHOOL, id)
        if (!check.canHardDelete) {
            throw ConflictException("Cannot delete school '$id' because it is referenced in the system")
        }
        val entity = schoolJpaRepository.findById(id).orElseThrow { NotFoundException("School not found with id: $id") }
        schoolJpaRepository.delete(entity)
    }
}
