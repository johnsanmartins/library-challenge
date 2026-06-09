package com.azurian.library.controller;

import com.azurian.library.dto.request.BookRequest;
import com.azurian.library.dto.response.BookResponse;
import com.azurian.library.exception.ResourceNotFoundException;
import com.azurian.library.service.BookService;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BookController.class)
@DisplayName("BookController Tests")
class BookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BookService bookService;

    private BookResponse testBookResponse;
    private BookRequest testBookRequest;

    @BeforeEach
    void setUp() {
        testBookResponse = new BookResponse();
        testBookResponse.setId(1L);
        testBookResponse.setTitle("Clean Code");
        testBookResponse.setIsbn("978-0132350884");
        testBookResponse.setAvailableCopies(3);

        testBookRequest = new BookRequest();
        testBookRequest.setTitle("Clean Code");
        testBookRequest.setIsbn("978-0132350884");
        testBookRequest.setAvailableCopies(3);
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/v1/books should return 200 with page")
    void findAll_shouldReturn200() throws Exception {
        when(bookService.findAll(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(testBookResponse)));

        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Clean Code"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/v1/books/{id} should return 200 when found")
    void findById_shouldReturn200() throws Exception {
        when(bookService.findById(1L)).thenReturn(testBookResponse);

        mockMvc.perform(get("/api/v1/books/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Clean Code"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/v1/books/{id} should return 404 when not found")
    void findById_shouldReturn404() throws Exception {
        when(bookService.findById(99L)).thenThrow(new ResourceNotFoundException("Book", 99L));

        mockMvc.perform(get("/api/v1/books/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/v1/books should return 201 when valid")
    void create_shouldReturn201() throws Exception {
        when(bookService.create(any(BookRequest.class))).thenReturn(testBookResponse);

        mockMvc.perform(post("/api/v1/books")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testBookRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Clean Code"));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/v1/books should return 400 when title is missing")
    void create_shouldReturn400_whenTitleMissing() throws Exception {
        testBookRequest.setTitle("");

        mockMvc.perform(post("/api/v1/books")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testBookRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").isArray());
    }

    @Test
    @WithMockUser
    @DisplayName("PUT /api/v1/books/{id} should return 200 when updated")
    void update_shouldReturn200() throws Exception {
        when(bookService.update(eq(1L), any(BookRequest.class))).thenReturn(testBookResponse);

        mockMvc.perform(put("/api/v1/books/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testBookRequest)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /api/v1/books/{id} should return 204")
    void delete_shouldReturn204() throws Exception {
        doNothing().when(bookService).delete(1L);

        mockMvc.perform(delete("/api/v1/books/1").with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /api/v1/books/{id} should return 404 when not found")
    void delete_shouldReturn404() throws Exception {
        doThrow(new ResourceNotFoundException("Book", 99L)).when(bookService).delete(99L);

        mockMvc.perform(delete("/api/v1/books/99").with(csrf()))
                .andExpect(status().isNotFound());
    }
}
