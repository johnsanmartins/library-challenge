package com.azurian.library.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Set;

@Data
public class BookRequest {

    @NotBlank(message = "El título es requerido")
    @Size(min = 1, max = 255, message = "El título debe tener entre 1 y 255 caracteres")
    private String title;

    // ISBN permisivo: dígitos, X, guiones y espacios, 9-17 caracteres
    @Pattern(regexp = "^[0-9Xx\\-\\s]{9,17}$", message = "Formato de ISBN inválido")
    private String isbn;

    @Min(value = 1000, message = "El año debe ser 1000 o posterior")
    @Max(value = 9999, message = "El año debe ser 9999 o anterior")
    private Integer publishedYear;

    @Size(max = 1000, message = "La sinopsis no puede superar 1000 caracteres")
    private String synopsis;

    @NotNull(message = "Las copias disponibles son requeridas")
    @Min(value = 0, message = "Las copias disponibles no pueden ser negativas")
    @Max(value = 999, message = "Las copias disponibles no pueden superar 999")
    private Integer availableCopies;

    private Long categoryId;

    private Set<Long> authorIds;
}
