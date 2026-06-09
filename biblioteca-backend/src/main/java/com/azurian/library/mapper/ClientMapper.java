package com.azurian.library.mapper;

import com.azurian.library.domain.Client;
import com.azurian.library.dto.request.ClientRequest;
import com.azurian.library.dto.response.ClientResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ClientMapper {

    ClientResponse toResponse(Client client);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "loans", ignore = true)
    @Mapping(target = "registrationDate", ignore = true)
    Client toEntity(ClientRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "loans", ignore = true)
    @Mapping(target = "registrationDate", ignore = true)
    void updateEntity(ClientRequest request, @MappingTarget Client client);
}
