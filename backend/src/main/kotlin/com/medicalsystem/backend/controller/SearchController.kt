package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.SearchResultDto
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.security.CurrentUser
import com.medicalsystem.backend.service.SearchService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/search")
class SearchController(
    private val searchService: SearchService
) {

    @GetMapping
    fun search(
        @RequestParam(name = "q", required = false, defaultValue = "") query: String,
        @RequestParam(name = "limit", required = false, defaultValue = "5") limit: Int,
        @CurrentUser user: User?
    ): ResponseEntity<SearchResultDto> {
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")
        val sanitizedLimit = limit.coerceIn(1, 20)
        return ResponseEntity.ok(searchService.globalSearch(query.trim(), currentUser, sanitizedLimit))
    }
}
