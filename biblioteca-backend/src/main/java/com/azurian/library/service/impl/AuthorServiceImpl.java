package com.azurian.library.service.impl;

import com.azurian.library.domain.Author;
import com.azurian.library.dto.request.AuthorRequest;
import com.azurian.library.dto.response.AuthorResponse;
import com.azurian.library.exception.BusinessException;
import com.azurian.library.exception.ResourceNotFoundException;
import com.azurian.library.mapper.AuthorMapper;
import com.azurian.library.repository.AuthorRepository;
import com.azurian.library.service.AuthorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AuthorServiceImpl implements AuthorService {

    private final AuthorRepository authorRepository;
    private final AuthorMapper authorMapper;

    @Override
    public Page<AuthorResponse> findAll(String search, Pageable pageable) {
        log.debug("Finding all authors with search='{}'", search);
        Page<Author> page = (search != null && !search.isBlank())
                ? authorRepository.findBySearch(search, pageable)
                : authorRepository.findAll(pageable);
        return page.map(authorMapper::toResponse);
    }

    @Override
    public AuthorResponse findById(Long id) {
        log.debug("Finding author by id={}", id);
        return authorMapper.toResponse(findAuthorOrThrow(id));
    }

    @Override
    @Transactional
    public AuthorResponse create(AuthorRequest request) {
        log.info("Creating author: {} {}", request.getFirstName(), request.getLastName());
        Author saved = authorRepository.save(authorMapper.toEntity(request));
        log.info("Author created with id={}", saved.getId());
        return authorMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public AuthorResponse update(Long id, AuthorRequest request) {
        log.info("Updating author id={}", id);
        Author author = findAuthorOrThrow(id);
        authorMapper.updateEntity(request, author);
        return authorMapper.toResponse(authorRepository.save(author));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        log.info("Deleting author id={}", id);
        Author author = findAuthorOrThrow(id);
        if (!author.getBooks().isEmpty()) {
            throw new BusinessException(
                "No se puede eliminar el autor porque tiene " + author.getBooks().size() +
                " libro(s) asociado(s). Primero debe desvincular los libros.");
        }
        authorRepository.delete(author);
    }

    private Author findAuthorOrThrow(Long id) {
        return authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Author", id));
    }
}
