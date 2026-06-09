package com.azurian.library.service;

import com.azurian.library.domain.Client;
import com.azurian.library.dto.request.ClientRequest;
import com.azurian.library.dto.response.ClientResponse;
import com.azurian.library.exception.BusinessException;
import com.azurian.library.exception.ResourceNotFoundException;
import com.azurian.library.mapper.ClientMapper;
import com.azurian.library.repository.ClientRepository;
import com.azurian.library.service.impl.ClientServiceImpl;
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
@DisplayName("ClientService Unit Tests")
class ClientServiceImplTest {

    @Mock
    private ClientRepository clientRepository;
    @Mock
    private ClientMapper clientMapper;

    @InjectMocks
    private ClientServiceImpl clientService;

    private Client testClient;
    private ClientResponse testClientResponse;
    private ClientRequest testClientRequest;

    @BeforeEach
    void setUp() {
        testClient = Client.builder()
                .id(1L)
                .firstName("Carlos")
                .lastName("Rodríguez")
                .email("carlos@example.com")
                .phone("+56912345678")
                .registrationDate(LocalDate.now())
                .build();

        testClientResponse = new ClientResponse();
        testClientResponse.setId(1L);
        testClientResponse.setFirstName("Carlos");
        testClientResponse.setLastName("Rodríguez");
        testClientResponse.setEmail("carlos@example.com");

        testClientRequest = new ClientRequest();
        testClientRequest.setFirstName("Carlos");
        testClientRequest.setLastName("Rodríguez");
        testClientRequest.setEmail("carlos@example.com");
        testClientRequest.setPhone("+56912345678");
    }

    @Test
    @DisplayName("findAll should return page of clients")
    void findAll_shouldReturnPage() {
        Pageable pageable = PageRequest.of(0, 10);
        when(clientRepository.findAll(pageable))
                .thenReturn(new PageImpl<>(List.of(testClient)));
        when(clientMapper.toResponse(testClient)).thenReturn(testClientResponse);

        Page<ClientResponse> result = clientService.findAll(null, pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(clientRepository).findAll(pageable);
    }

    @Test
    @DisplayName("findAll with search should filter clients")
    void findAll_withSearch_shouldFilter() {
        Pageable pageable = PageRequest.of(0, 10);
        when(clientRepository.findBySearch("Carlos", pageable))
                .thenReturn(new PageImpl<>(List.of(testClient)));
        when(clientMapper.toResponse(testClient)).thenReturn(testClientResponse);

        Page<ClientResponse> result = clientService.findAll("Carlos", pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(clientRepository).findBySearch("Carlos", pageable);
    }

    @Test
    @DisplayName("findById should return client when found")
    void findById_shouldReturnClient() {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(testClient));
        when(clientMapper.toResponse(testClient)).thenReturn(testClientResponse);

        ClientResponse result = clientService.findById(1L);

        assertThat(result.getEmail()).isEqualTo("carlos@example.com");
    }

    @Test
    @DisplayName("findById should throw when not found")
    void findById_shouldThrow_whenNotFound() {
        when(clientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> clientService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("create should save new client")
    void create_shouldSaveClient() {
        when(clientRepository.existsByEmail(testClientRequest.getEmail())).thenReturn(false);
        when(clientMapper.toEntity(testClientRequest)).thenReturn(testClient);
        when(clientRepository.save(testClient)).thenReturn(testClient);
        when(clientMapper.toResponse(testClient)).thenReturn(testClientResponse);

        ClientResponse result = clientService.create(testClientRequest);

        assertThat(result).isNotNull();
        verify(clientRepository).save(testClient);
    }

    @Test
    @DisplayName("create should throw when email already exists")
    void create_shouldThrow_whenEmailExists() {
        when(clientRepository.existsByEmail(testClientRequest.getEmail())).thenReturn(true);

        assertThatThrownBy(() -> clientService.create(testClientRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    @DisplayName("update should update client")
    void update_shouldUpdateClient() {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(testClient));
        when(clientRepository.save(testClient)).thenReturn(testClient);
        when(clientMapper.toResponse(testClient)).thenReturn(testClientResponse);

        ClientResponse result = clientService.update(1L, testClientRequest);

        assertThat(result).isNotNull();
        verify(clientMapper).updateEntity(testClientRequest, testClient);
    }

    @Test
    @DisplayName("delete should remove client with no loans")
    void delete_shouldRemoveClient() {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(testClient));

        clientService.delete(1L);

        verify(clientRepository).delete(testClient);
    }

    @Test
    @DisplayName("delete should throw when client has loans")
    void delete_shouldThrow_whenClientHasLoans() {
        testClient.getLoans().add(new com.azurian.library.domain.Loan());
        when(clientRepository.findById(1L)).thenReturn(Optional.of(testClient));

        assertThatThrownBy(() -> clientService.delete(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("loans");
    }
}
