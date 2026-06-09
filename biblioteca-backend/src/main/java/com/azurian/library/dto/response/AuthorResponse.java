package com.azurian.library.dto.response;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AuthorResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String nationality;
    private LocalDate birthDate;
}
