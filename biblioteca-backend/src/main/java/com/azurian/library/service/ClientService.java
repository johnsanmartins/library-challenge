package com.azurian.library.service;

import com.azurian.library.dto.request.ClientRequest;
import com.azurian.library.dto.response.ClientResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ClientService {
    Page<ClientResponse> findAll(String search, Pageable pageable);
    ClientResponse findById(Long id);
    ClientResponse create(ClientRequest request);
    ClientResponse update(Long id, ClientRequest request);
    void delete(Long id);
}
