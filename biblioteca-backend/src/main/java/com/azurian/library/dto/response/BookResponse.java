package com.azurian.library.dto.response;

import lombok.Data;

import java.util.Set;

@Data
public class BookResponse {
    private Long id;
    private String title;
    private String isbn;
    private Integer publishedYear;
    private String synopsis;
    private Integer availableCopies;
    private CategoryResponse category;
    private Set<AuthorResponse> authors;
}
