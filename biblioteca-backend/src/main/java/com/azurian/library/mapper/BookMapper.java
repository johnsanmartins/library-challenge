package com.azurian.library.mapper;

import com.azurian.library.domain.Book;
import com.azurian.library.dto.request.BookRequest;
import com.azurian.library.dto.response.BookResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {CategoryMapper.class, AuthorMapper.class})
public interface BookMapper {

    BookResponse toResponse(Book book);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "authors", ignore = true)
    @Mapping(target = "loans", ignore = true)
    Book toEntity(BookRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "authors", ignore = true)
    @Mapping(target = "loans", ignore = true)
    void updateEntity(BookRequest request, @MappingTarget Book book);
}
