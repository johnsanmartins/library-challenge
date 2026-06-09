package com.azurian.library.dto.response;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ClientResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate registrationDate;
}
