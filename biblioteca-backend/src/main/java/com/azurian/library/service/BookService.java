package com.azurian.library.service;

import com.azurian.library.dto.request.BookRequest;
import com.azurian.library.dto.response.BookResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookService {
    Page<BookResponse> findAll(String search, Pageable pageable);
    BookResponse findById(Long id);
    BookResponse create(BookRequest request);
    BookResponse update(Long id, BookRequest request);
    void delete(Long id);
}
