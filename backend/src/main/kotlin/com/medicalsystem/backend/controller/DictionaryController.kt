package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.EthnicityDto
import com.medicalsystem.backend.service.DictionaryService
import org.springframework.http.CacheControl
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.concurrent.TimeUnit

@RestController
@RequestMapping("/api/dictionaries")
class DictionaryController(
    private val dictionaryService: DictionaryService
) {

    @GetMapping("/ethnicities")
    fun getEthnicities(): ResponseEntity<List<EthnicityDto>> {
        val list = dictionaryService.getAllEthnicities()
        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic().mustRevalidate())
            .body(list)
    }
}
