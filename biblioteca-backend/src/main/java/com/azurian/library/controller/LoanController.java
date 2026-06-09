package com.azurian.library.controller;

import com.azurian.library.domain.LoanStatus;
import com.azurian.library.dto.request.LoanRequest;
import com.azurian.library.dto.response.LoanResponse;
import com.azurian.library.service.LoanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/loans")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Loans", description = "Loan management endpoints")
public class LoanController {

    private final LoanService loanService;

    @GetMapping
    @Operation(summary = "Get all loans (paginated, filterable by status)")
    public ResponseEntity<Page<LoanResponse>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "loanDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) LoanStatus status) {
        Pageable pageable = PageRequest.of(page, size,
                sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending());
        return ResponseEntity.ok(loanService.findAll(status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get loan by ID")
    public ResponseEntity<LoanResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new loan")
    public ResponseEntity<LoanResponse> create(@Valid @RequestBody LoanRequest request) {
        log.info("POST /api/v1/loans - bookId={}, clientId={}", request.getBookId(), request.getClientId());
        return ResponseEntity.status(HttpStatus.CREATED).body(loanService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a loan (e.g., return a book)")
    public ResponseEntity<LoanResponse> update(
            @PathVariable Long id, @Valid @RequestBody LoanRequest request) {
        log.info("PUT /api/v1/loans/{}", id);
        return ResponseEntity.ok(loanService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a loan")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /api/v1/loans/{}", id);
        loanService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
