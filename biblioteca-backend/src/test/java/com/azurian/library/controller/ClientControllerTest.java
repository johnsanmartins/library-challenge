package com.azurian.library.controller;

import com.azurian.library.dto.request.ClientRequest;
import com.azurian.library.dto.response.ClientResponse;
import com.azurian.library.exception.BusinessException;
import com.azurian.library.exception.ResourceNotFoundException;
import com.azurian.library.service.ClientService;
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

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClientController.class)
@DisplayName("ClientController Tests")
class ClientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ClientService clientService;

    private ClientResponse testClientResponse;
    private ClientRequest testClientRequest;

    @BeforeEach
    void setUp() {
        testClientResponse = new ClientResponse();
        testClientResponse.setId(1L);
        testClientResponse.setFirstName("Carlos");
        testClientResponse.setLastName("Rodríguez");
        testClientResponse.setEmail("carlos@example.com");
        testClientResponse.setRegistrationDate(LocalDate.now());

        testClientRequest = new ClientRequest();
        testClientRequest.setFirstName("Carlos");
        testClientRequest.setLastName("Rodríguez");
        testClientRequest.setEmail("carlos@example.com");
        testClientRequest.setPhone("+56912345678");
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/v1/clients should return 200")
    void findAll_shouldReturn200() throws Exception {
        when(clientService.findAll(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(testClientResponse)));

        mockMvc.perform(get("/api/v1/clients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].email").value("carlos@example.com"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/v1/clients/{id} should return 200")
    void findById_shouldReturn200() throws Exception {
        when(clientService.findById(1L)).thenReturn(testClientResponse);

        mockMvc.perform(get("/api/v1/clients/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/v1/clients/{id} should return 404")
    void findById_shouldReturn404() throws Exception {
        when(clientService.findById(99L)).thenThrow(new ResourceNotFoundException("Client", 99L));

        mockMvc.perform(get("/api/v1/clients/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/v1/clients should return 201")
    void create_shouldReturn201() throws Exception {
        when(clientService.create(any(ClientRequest.class))).thenReturn(testClientResponse);

        mockMvc.perform(post("/api/v1/clients")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testClientRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("carlos@example.com"));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/v1/clients should return 400 when email is invalid")
    void create_shouldReturn400_whenEmailInvalid() throws Exception {
        testClientRequest.setEmail("not-a-valid-email");

        mockMvc.perform(post("/api/v1/clients")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testClientRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/v1/clients should return 409 when email already exists")
    void create_shouldReturn409_whenEmailExists() throws Exception {
        when(clientService.create(any())).thenThrow(new BusinessException("already exists"));

        mockMvc.perform(post("/api/v1/clients")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testClientRequest)))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser
    @DisplayName("PUT /api/v1/clients/{id} should return 200")
    void update_shouldReturn200() throws Exception {
        when(clientService.update(eq(1L), any(ClientRequest.class))).thenReturn(testClientResponse);

        mockMvc.perform(put("/api/v1/clients/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testClientRequest)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /api/v1/clients/{id} should return 204")
    void delete_shouldReturn204() throws Exception {
        doNothing().when(clientService).delete(1L);

        mockMvc.perform(delete("/api/v1/clients/1").with(csrf()))
                .andExpect(status().isNoContent());
    }
}
