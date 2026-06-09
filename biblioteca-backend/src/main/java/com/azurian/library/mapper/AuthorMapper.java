package com.azurian.library.mapper;

import com.azurian.library.domain.Author;
import com.azurian.library.dto.request.AuthorRequest;
import com.azurian.library.dto.response.AuthorResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface AuthorMapper {

    AuthorResponse toResponse(Author author);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "books", ignore = true)
    Author toEntity(AuthorRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "books", ignore = true)
    void updateEntity(AuthorRequest request, @MappingTarget Author author);
}
