package com.azurian.library.controller;

import com.azurian.library.domain.LoanStatus;
import com.azurian.library.dto.request.LoanRequest;
import com.azurian.library.dto.response.LoanResponse;
import com.azurian.library.exception.BusinessException;
import com.azurian.library.service.LoanService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LoanController.class)
@DisplayName("LoanController Tests")
class LoanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LoanService loanService;

    private ObjectMapper objectMapper;
    private LoanResponse testLoanResponse;
    private LoanRequest testLoanRequest;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

        testLoanResponse = new LoanResponse();
        testLoanResponse.setId(1L);
        testLoanResponse.setStatus(LoanStatus.ACTIVE);
        testLoanResponse.setLoanDate(LocalDate.now());
        testLoanResponse.setDueDate(LocalDate.now().plusDays(14));

        testLoanRequest = new LoanRequest();
        testLoanRequest.setBookId(1L);
        testLoanRequest.setClientId(1L);
        testLoanRequest.setDueDate(LocalDate.now().plusDays(14));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/v1/loans should return 200")
    void findAll_shouldReturn200() throws Exception {
        when(loanService.findAll(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(testLoanResponse)));

        mockMvc.perform(get("/api/v1/loans"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].status").value("ACTIVE"));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/v1/loans should return 201")
    void create_shouldReturn201() throws Exception {
        when(loanService.create(any(LoanRequest.class))).thenReturn(testLoanResponse);

        mockMvc.perform(post("/api/v1/loans")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testLoanRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/v1/loans should return 400 when bookId missing")
    void create_shouldReturn400_whenBookIdMissing() throws Exception {
        testLoanRequest.setBookId(null);

        mockMvc.perform(post("/api/v1/loans")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testLoanRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @DisplayName("POST should return 409 when no copies available")
    void create_shouldReturn409_whenNoAvailableCopies() throws Exception {
        when(loanService.create(any())).thenThrow(new BusinessException("No available copies"));

        mockMvc.perform(post("/api/v1/loans")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testLoanRequest)))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser
    @DisplayName("PUT /api/v1/loans/{id} should return 200")
    void update_shouldReturn200() throws Exception {
        testLoanRequest.setStatus(LoanStatus.RETURNED);
        when(loanService.update(eq(1L), any(LoanRequest.class))).thenReturn(testLoanResponse);

        mockMvc.perform(put("/api/v1/loans/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testLoanRequest)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /api/v1/loans/{id} should return 204")
    void delete_shouldReturn204() throws Exception {
        doNothing().when(loanService).delete(1L);

        mockMvc.perform(delete("/api/v1/loans/1").with(csrf()))
                .andExpect(status().isNoContent());
    }
}
