package com.azurian.library.service.impl;

import com.azurian.library.domain.Author;
import com.azurian.library.domain.Book;
import com.azurian.library.domain.Category;
import com.azurian.library.dto.request.BookRequest;
import com.azurian.library.dto.response.BookResponse;
import com.azurian.library.exception.BusinessException;
import com.azurian.library.exception.ResourceNotFoundException;
import com.azurian.library.mapper.BookMapper;
import com.azurian.library.repository.AuthorRepository;
import com.azurian.library.repository.BookRepository;
import com.azurian.library.repository.CategoryRepository;
import com.azurian.library.service.BookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final AuthorRepository authorRepository;
    private final BookMapper bookMapper;

    @Override
    public Page<BookResponse> findAll(String search, Pageable pageable) {
        log.debug("Finding all books with search='{}'", search);
        Page<Book> page = (search != null && !search.isBlank())
                ? bookRepository.findBySearch(search, pageable)
                : bookRepository.findAllBooks(pageable);
        return page.map(bookMapper::toResponse);
    }

    @Override
    public BookResponse findById(Long id) {
        log.debug("Finding book by id={}", id);
        return bookMapper.toResponse(findBookOrThrow(id));
    }

    @Override
    @Transactional
    public BookResponse create(BookRequest request) {
        log.info("Creating book with title='{}'", request.getTitle());
        if (request.getIsbn() != null && bookRepository.existsByIsbn(request.getIsbn())) {
            throw new BusinessException("Book with ISBN '" + request.getIsbn() + "' already exists");
        }

        Book book = bookMapper.toEntity(request);
        resolveAssociations(book, request);

        Book saved = bookRepository.save(book);
        log.info("Book created with id={}", saved.getId());
        return bookMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BookResponse update(Long id, BookRequest request) {
        log.info("Updating book id={}", id);
        Book book = findBookOrThrow(id);

        if (request.getIsbn() != null && !request.getIsbn().equals(book.getIsbn())
                && bookRepository.existsByIsbn(request.getIsbn())) {
            throw new BusinessException("Book with ISBN '" + request.getIsbn() + "' already exists");
        }

        bookMapper.updateEntity(request, book);
        resolveAssociations(book, request);
        return bookMapper.toResponse(bookRepository.save(book));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        log.info("Deleting book id={}", id);
        Book book = findBookOrThrow(id);
        bookRepository.delete(book);
    }

    private void resolveAssociations(Book book, BookRequest request) {
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
            book.setCategory(category);
        } else {
            book.setCategory(null);
        }

        if (request.getAuthorIds() != null && !request.getAuthorIds().isEmpty()) {
            Set<Author> authors = new HashSet<>(authorRepository.findAllById(request.getAuthorIds()));
            if (authors.size() != request.getAuthorIds().size()) {
                throw new BusinessException("One or more author IDs are invalid");
            }
            book.setAuthors(authors);
        } else {
            book.setAuthors(new HashSet<>());
        }
    }

    private Book findBookOrThrow(Long id) {
        return bookRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", id));
    }
}
