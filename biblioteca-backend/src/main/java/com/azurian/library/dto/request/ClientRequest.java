package com.azurian.library.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ClientRequest {

    @NotBlank(message = "El nombre es requerido")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    @Pattern(regexp = "^[a-zA-ZÀ-ÿ\\s'\\-]+$", message = "El nombre solo puede contener letras")
    private String firstName;

    @NotBlank(message = "El apellido es requerido")
    @Size(min = 2, max = 100, message = "El apellido debe tener entre 2 y 100 caracteres")
    @Pattern(regexp = "^[a-zA-ZÀ-ÿ\\s'\\-]+$", message = "El apellido solo puede contener letras")
    private String lastName;

    @NotBlank(message = "El correo es requerido")
    @Email(message = "El correo debe ser válido")
    @Size(max = 150, message = "El correo no puede superar 150 caracteres")
    private String email;

    @Pattern(regexp = "^[+]?[0-9\\s\\-().]{7,20}$", message = "El número de teléfono es inválido")
    private String phone;
}
