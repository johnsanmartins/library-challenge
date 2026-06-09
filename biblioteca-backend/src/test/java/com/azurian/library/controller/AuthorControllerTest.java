package com.azurian.library.controller;

import com.azurian.library.dto.request.AuthorRequest;
import com.azurian.library.dto.response.AuthorResponse;
import com.azurian.library.exception.ResourceNotFoundException;
import com.azurian.library.service.AuthorService;
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

@WebMvcTest(AuthorController.class)
@DisplayName("AuthorController Tests")
class AuthorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthorService authorService;

    private ObjectMapper objectMapper;
    private AuthorResponse testAuthorResponse;
    private AuthorRequest testAuthorRequest;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

        testAuthorResponse = new AuthorResponse();
        testAuthorResponse.setId(1L);
        testAuthorResponse.setFirstName("Gabriel");
        testAuthorResponse.setLastName("García Márquez");
        testAuthorResponse.setNationality("Colombian");

        testAuthorRequest = new AuthorRequest();
        testAuthorRequest.setFirstName("Gabriel");
        testAuthorRequest.setLastName("García Márquez");
        testAuthorRequest.setNationality("Colombian");
        testAuthorRequest.setBirthDate(LocalDate.of(1927, 3, 6));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/v1/authors should return 200")
    void findAll_shouldReturn200() throws Exception {
        when(authorService.findAll(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(testAuthorResponse)));

        mockMvc.perform(get("/api/v1/authors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].firstName").value("Gabriel"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/v1/authors/{id} should return 200")
    void findById_shouldReturn200() throws Exception {
        when(authorService.findById(1L)).thenReturn(testAuthorResponse);

        mockMvc.perform(get("/api/v1/authors/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastName").value("García Márquez"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/v1/authors/{id} should return 404")
    void findById_shouldReturn404() throws Exception {
        when(authorService.findById(99L)).thenThrow(new ResourceNotFoundException("Author", 99L));

        mockMvc.perform(get("/api/v1/authors/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/v1/authors should return 201")
    void create_shouldReturn201() throws Exception {
        when(authorService.create(any(AuthorRequest.class))).thenReturn(testAuthorResponse);

        mockMvc.perform(post("/api/v1/authors")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testAuthorRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("Gabriel"));
    }

    @Test
    @WithMockUser
    @DisplayName("PUT /api/v1/authors/{id} should return 200")
    void update_shouldReturn200() throws Exception {
        when(authorService.update(eq(1L), any(AuthorRequest.class))).thenReturn(testAuthorResponse);

        mockMvc.perform(put("/api/v1/authors/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testAuthorRequest)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /api/v1/authors/{id} should return 204")
    void delete_shouldReturn204() throws Exception {
        doNothing().when(authorService).delete(1L);

        mockMvc.perform(delete("/api/v1/authors/1").with(csrf()))
                .andExpect(status().isNoContent());
    }
}
