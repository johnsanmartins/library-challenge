package com.azurian.library.service;

import com.azurian.library.domain.LoanStatus;
import com.azurian.library.dto.request.LoanRequest;
import com.azurian.library.dto.response.LoanResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LoanService {
    Page<LoanResponse> findAll(LoanStatus status, Pageable pageable);
    LoanResponse findById(Long id);
    LoanResponse create(LoanRequest request);
    LoanResponse update(Long id, LoanRequest request);
    void delete(Long id);
}
