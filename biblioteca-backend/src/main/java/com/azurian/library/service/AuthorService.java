package com.azurian.library.service;

import com.azurian.library.dto.request.AuthorRequest;
import com.azurian.library.dto.response.AuthorResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuthorService {
    Page<AuthorResponse> findAll(String search, Pageable pageable);
    AuthorResponse findById(Long id);
    AuthorResponse create(AuthorRequest request);
    AuthorResponse update(Long id, AuthorRequest request);
    void delete(Long id);
}
