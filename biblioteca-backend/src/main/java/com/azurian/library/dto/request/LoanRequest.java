package com.azurian.library.dto.request;

import com.azurian.library.domain.LoanStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class LoanRequest {

    @NotNull(message = "Book ID is required")
    private Long bookId;

    @NotNull(message = "Client ID is required")
    private Long clientId;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private LoanStatus status;
}
