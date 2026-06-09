package com.azurian.library.mapper;

import com.azurian.library.domain.Category;
import com.azurian.library.dto.request.CategoryRequest;
import com.azurian.library.dto.response.CategoryResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "bookCount", expression = "java(category.getBooks().size())")
    CategoryResponse toResponse(Category category);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "books", ignore = true)
    Category toEntity(CategoryRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "books", ignore = true)
    void updateEntity(CategoryRequest request, @MappingTarget Category category);
}
