package com.azurian.library.service;

import com.azurian.library.domain.*;
import com.azurian.library.dto.request.LoanRequest;
import com.azurian.library.dto.response.LoanResponse;
import com.azurian.library.exception.BusinessException;
import com.azurian.library.exception.ResourceNotFoundException;
import com.azurian.library.mapper.LoanMapper;
import com.azurian.library.repository.BookRepository;
import com.azurian.library.repository.ClientRepository;
import com.azurian.library.repository.LoanRepository;
import com.azurian.library.service.impl.LoanServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("LoanService Unit Tests")
class LoanServiceImplTest {

    @Mock
    private LoanRepository loanRepository;
    @Mock
    private BookRepository bookRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private LoanMapper loanMapper;

    @InjectMocks
    private LoanServiceImpl loanService;

    private Book testBook;
    private Client testClient;
    private Loan testLoan;
    private LoanResponse testLoanResponse;
    private LoanRequest testLoanRequest;

    @BeforeEach
    void setUp() {
        testBook = Book.builder()
                .id(1L)
                .title("Clean Code")
                .availableCopies(3)
                .build();

        testClient = Client.builder()
                .id(1L)
                .firstName("Carlos")
                .lastName("Rodríguez")
                .email("carlos@example.com")
                .build();

        testLoan = Loan.builder()
                .id(1L)
                .book(testBook)
                .client(testClient)
                .loanDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(14))
                .status(LoanStatus.ACTIVE)
                .build();

        testLoanResponse = new LoanResponse();
        testLoanResponse.setId(1L);
        testLoanResponse.setStatus(LoanStatus.ACTIVE);

        testLoanRequest = new LoanRequest();
        testLoanRequest.setBookId(1L);
        testLoanRequest.setClientId(1L);
        testLoanRequest.setDueDate(LocalDate.now().plusDays(14));
    }

    @Test
    @DisplayName("findAll should return paginated loans")
    void findAll_shouldReturnPage() {
        Pageable pageable = PageRequest.of(0, 10);
        when(loanRepository.findAllLoans(pageable))
                .thenReturn(new PageImpl<>(List.of(testLoan)));
        when(loanMapper.toResponse(testLoan)).thenReturn(testLoanResponse);

        Page<LoanResponse> result = loanService.findAll(null, pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(loanRepository).findAllLoans(pageable);
    }

    @Test
    @DisplayName("findAll filtered by status should use findByStatus")
    void findAll_withStatus_shouldFilter() {
        Pageable pageable = PageRequest.of(0, 10);
        when(loanRepository.findByStatus(LoanStatus.ACTIVE, pageable))
                .thenReturn(new PageImpl<>(List.of(testLoan)));
        when(loanMapper.toResponse(testLoan)).thenReturn(testLoanResponse);

        Page<LoanResponse> result = loanService.findAll(LoanStatus.ACTIVE, pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(loanRepository).findByStatus(LoanStatus.ACTIVE, pageable);
    }

    @Test
    @DisplayName("findById should return loan when found")
    void findById_shouldReturnLoan() {
        when(loanRepository.findById(1L)).thenReturn(Optional.of(testLoan));
        when(loanMapper.toResponse(testLoan)).thenReturn(testLoanResponse);

        LoanResponse result = loanService.findById(1L);

        assertThat(result.getStatus()).isEqualTo(LoanStatus.ACTIVE);
    }

    @Test
    @DisplayName("findById should throw when not found")
    void findById_shouldThrow_whenNotFound() {
        when(loanRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> loanService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("create should create loan and decrease available copies")
    void create_shouldCreateLoan() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));
        when(clientRepository.findById(1L)).thenReturn(Optional.of(testClient));
        when(loanRepository.existsByBookIdAndClientIdAndStatus(1L, 1L, LoanStatus.ACTIVE)).thenReturn(false);
        when(loanRepository.save(any(Loan.class))).thenReturn(testLoan);
        when(loanMapper.toResponse(testLoan)).thenReturn(testLoanResponse);

        LoanResponse result = loanService.create(testLoanRequest);

        assertThat(result).isNotNull();
        assertThat(testBook.getAvailableCopies()).isEqualTo(2);
        verify(bookRepository).save(testBook);
    }

    @Test
    @DisplayName("create should throw when no available copies")
    void create_shouldThrow_whenNoAvailableCopies() {
        testBook.setAvailableCopies(0);
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));

        assertThatThrownBy(() -> loanService.create(testLoanRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("No available copies");
    }

    @Test
    @DisplayName("create should throw when active loan already exists")
    void create_shouldThrow_whenActiveLoanExists() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));
        when(clientRepository.findById(1L)).thenReturn(Optional.of(testClient));
        when(loanRepository.existsByBookIdAndClientIdAndStatus(1L, 1L, LoanStatus.ACTIVE)).thenReturn(true);

        assertThatThrownBy(() -> loanService.create(testLoanRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("active loan");
    }

    @Test
    @DisplayName("update should return book and set RETURNED status")
    void update_shouldReturnBook() {
        LoanRequest returnRequest = new LoanRequest();
        returnRequest.setBookId(1L);
        returnRequest.setClientId(1L);
        returnRequest.setDueDate(testLoan.getDueDate());
        returnRequest.setStatus(LoanStatus.RETURNED);

        when(loanRepository.findById(1L)).thenReturn(Optional.of(testLoan));
        when(loanRepository.save(testLoan)).thenReturn(testLoan);
        when(loanMapper.toResponse(testLoan)).thenReturn(testLoanResponse);

        loanService.update(1L, returnRequest);

        assertThat(testLoan.getStatus()).isEqualTo(LoanStatus.RETURNED);
        assertThat(testLoan.getReturnDate()).isNotNull();
        assertThat(testBook.getAvailableCopies()).isEqualTo(4);
    }

    @Test
    @DisplayName("delete should throw when loan is active")
    void delete_shouldThrow_whenActive() {
        when(loanRepository.findById(1L)).thenReturn(Optional.of(testLoan));

        assertThatThrownBy(() -> loanService.delete(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("active loan");
    }

    @Test
    @DisplayName("delete should succeed for returned loan")
    void delete_shouldSucceed_whenReturned() {
        testLoan.setStatus(LoanStatus.RETURNED);
        when(loanRepository.findById(1L)).thenReturn(Optional.of(testLoan));

        loanService.delete(1L);

        verify(loanRepository).delete(testLoan);
    }
}
