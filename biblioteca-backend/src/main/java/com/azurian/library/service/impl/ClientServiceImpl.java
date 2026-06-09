package com.azurian.library.service.impl;

import com.azurian.library.domain.Client;
import com.azurian.library.dto.request.ClientRequest;
import com.azurian.library.dto.response.ClientResponse;
import com.azurian.library.exception.BusinessException;
import com.azurian.library.exception.ResourceNotFoundException;
import com.azurian.library.mapper.ClientMapper;
import com.azurian.library.repository.ClientRepository;
import com.azurian.library.service.ClientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;

    @Override
    public Page<ClientResponse> findAll(String search, Pageable pageable) {
        log.debug("Finding all clients with search='{}'", search);
        Page<Client> page = (search != null && !search.isBlank())
                ? clientRepository.findBySearch(search, pageable)
                : clientRepository.findAll(pageable);
        return page.map(clientMapper::toResponse);
    }

    @Override
    public ClientResponse findById(Long id) {
        log.debug("Finding client by id={}", id);
        return clientMapper.toResponse(findClientOrThrow(id));
    }

    @Override
    @Transactional
    public ClientResponse create(ClientRequest request) {
        log.info("Creating client with email='{}'", request.getEmail());
        if (clientRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Client with email '" + request.getEmail() + "' already exists");
        }
        Client saved = clientRepository.save(clientMapper.toEntity(request));
        log.info("Client created with id={}", saved.getId());
        return clientMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ClientResponse update(Long id, ClientRequest request) {
        log.info("Updating client id={}", id);
        Client client = findClientOrThrow(id);
        if (!client.getEmail().equalsIgnoreCase(request.getEmail())
                && clientRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Client with email '" + request.getEmail() + "' already exists");
        }
        clientMapper.updateEntity(request, client);
        return clientMapper.toResponse(clientRepository.save(client));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        log.info("Deleting client id={}", id);
        Client client = findClientOrThrow(id);
        if (!client.getLoans().isEmpty()) {
            throw new BusinessException("Cannot delete client with associated loans");
        }
        clientRepository.delete(client);
    }

    private Client findClientOrThrow(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client", id));
    }
}
