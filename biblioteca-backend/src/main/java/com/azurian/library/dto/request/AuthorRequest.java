package com.azurian.library.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AuthorRequest {

    @NotBlank(message = "El nombre es requerido")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    @Pattern(regexp = "^[a-zA-ZÀ-ÿ\\s'\\-]+$", message = "El nombre solo puede contener letras")
    private String firstName;

    @NotBlank(message = "El apellido es requerido")
    @Size(min = 2, max = 100, message = "El apellido debe tener entre 2 y 100 caracteres")
    @Pattern(regexp = "^[a-zA-ZÀ-ÿ\\s'\\-]+$", message = "El apellido solo puede contener letras")
    private String lastName;

    @Size(max = 100, message = "La nacionalidad no puede superar 100 caracteres")
    private String nationality;

    @Past(message = "La fecha de nacimiento debe ser en el pasado")
    private LocalDate birthDate;
}
