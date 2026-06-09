package com.azurian.library.service.impl;

import com.azurian.library.domain.Book;
import com.azurian.library.domain.Client;
import com.azurian.library.domain.Loan;
import com.azurian.library.domain.LoanStatus;
import com.azurian.library.dto.request.LoanRequest;
import com.azurian.library.dto.response.LoanResponse;
import com.azurian.library.exception.BusinessException;
import com.azurian.library.exception.ResourceNotFoundException;
import com.azurian.library.mapper.LoanMapper;
import com.azurian.library.repository.BookRepository;
import com.azurian.library.repository.ClientRepository;
import com.azurian.library.repository.LoanRepository;
import com.azurian.library.service.LoanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LoanServiceImpl implements LoanService {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final ClientRepository clientRepository;
    private final LoanMapper loanMapper;

    @Override
    public Page<LoanResponse> findAll(LoanStatus status, Pageable pageable) {
        log.debug("Finding all loans with status={}", status);
        Page<Loan> page = (status != null)
                ? loanRepository.findByStatus(status, pageable)
                : loanRepository.findAllLoans(pageable);
        return page.map(loanMapper::toResponse);
    }

    @Override
    public LoanResponse findById(Long id) {
        log.debug("Finding loan by id={}", id);
        return loanMapper.toResponse(findLoanOrThrow(id));
    }

    @Override
    @Transactional
    public LoanResponse create(LoanRequest request) {
        log.info("Creating loan for bookId={}, clientId={}", request.getBookId(), request.getClientId());

        if (request.getDueDate() == null || !request.getDueDate().isAfter(LocalDate.now())) {
            throw new BusinessException("La fecha de vencimiento debe ser una fecha futura");
        }

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book", request.getBookId()));

        if (book.getAvailableCopies() <= 0) {
            throw new BusinessException("No available copies for book '" + book.getTitle() + "'");
        }

        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client", request.getClientId()));

        if (loanRepository.existsByBookIdAndClientIdAndStatus(book.getId(), client.getId(), LoanStatus.ACTIVE)) {
            throw new BusinessException("Client already has an active loan for this book");
        }

        Loan loan = Loan.builder()
                .book(book)
                .client(client)
                .dueDate(request.getDueDate())
                .status(LoanStatus.ACTIVE)
                .build();

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        Loan saved = loanRepository.save(loan);
        log.info("Loan created with id={}", saved.getId());
        return loanMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public LoanResponse update(Long id, LoanRequest request) {
        log.info("Updating loan id={}", id);
        Loan loan = findLoanOrThrow(id);

        if (request.getStatus() != null && request.getStatus() == LoanStatus.RETURNED
                && loan.getStatus() == LoanStatus.ACTIVE) {
            loan.setStatus(LoanStatus.RETURNED);
            loan.setReturnDate(java.time.LocalDate.now());
            Book book = loan.getBook();
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookRepository.save(book);
            log.info("Loan id={} returned, book copies restored", id);
        } else if (request.getStatus() != null) {
            loan.setStatus(request.getStatus());
        }

        if (request.getDueDate() != null) {
            loan.setDueDate(request.getDueDate());
        }

        return loanMapper.toResponse(loanRepository.save(loan));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        log.info("Deleting loan id={}", id);
        Loan loan = findLoanOrThrow(id);
        if (loan.getStatus() == LoanStatus.ACTIVE) {
            throw new BusinessException("Cannot delete an active loan. Return the book first.");
        }
        loanRepository.delete(loan);
    }

    private Loan findLoanOrThrow(Long id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan", id));
    }
}
