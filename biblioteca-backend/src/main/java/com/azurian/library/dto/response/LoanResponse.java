package com.azurian.library.dto.response;

import com.azurian.library.domain.LoanStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class LoanResponse {
    private Long id;
    private BookResponse book;
    private ClientResponse client;
    private LocalDate loanDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private LoanStatus status;
}
