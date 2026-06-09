package com.azurian.library.service;

import com.azurian.library.domain.Author;
import com.azurian.library.dto.request.AuthorRequest;
import com.azurian.library.dto.response.AuthorResponse;
import com.azurian.library.exception.ResourceNotFoundException;
import com.azurian.library.mapper.AuthorMapper;
import com.azurian.library.repository.AuthorRepository;
import com.azurian.library.service.impl.AuthorServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthorService Unit Tests")
class AuthorServiceImplTest {

    @Mock
    private AuthorRepository authorRepository;
    @Mock
    private AuthorMapper authorMapper;

    @InjectMocks
    private AuthorServiceImpl authorService;

    private Author testAuthor;
    private AuthorResponse testAuthorResponse;
    private AuthorRequest testAuthorRequest;

    @BeforeEach
    void setUp() {
        testAuthor = Author.builder()
                .id(1L)
                .firstName("Gabriel")
                .lastName("García Márquez")
                .nationality("Colombian")
                .birthDate(LocalDate.of(1927, 3, 6))
                .build();

        testAuthorResponse = new AuthorResponse();
        testAuthorResponse.setId(1L);
        testAuthorResponse.setFirstName("Gabriel");
        testAuthorResponse.setLastName("García Márquez");

        testAuthorRequest = new AuthorRequest();
        testAuthorRequest.setFirstName("Gabriel");
        testAuthorRequest.setLastName("García Márquez");
        testAuthorRequest.setNationality("Colombian");
    }

    @Test
    @DisplayName("findAll should return paginated authors")
    void findAll_shouldReturnPage() {
        Pageable pageable = PageRequest.of(0, 10);
        when(authorRepository.findAll(pageable))
                .thenReturn(new PageImpl<>(List.of(testAuthor)));
        when(authorMapper.toResponse(testAuthor)).thenReturn(testAuthorResponse);

        Page<AuthorResponse> result = authorService.findAll(null, pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(authorRepository).findAll(pageable);
    }

    @Test
    @DisplayName("findAll with search should filter authors")
    void findAll_withSearch_shouldFilter() {
        Pageable pageable = PageRequest.of(0, 10);
        when(authorRepository.findBySearch("Gabriel", pageable))
                .thenReturn(new PageImpl<>(List.of(testAuthor)));
        when(authorMapper.toResponse(testAuthor)).thenReturn(testAuthorResponse);

        Page<AuthorResponse> result = authorService.findAll("Gabriel", pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(authorRepository).findBySearch("Gabriel", pageable);
    }

    @Test
    @DisplayName("findById should return author when found")
    void findById_shouldReturnAuthor() {
        when(authorRepository.findById(1L)).thenReturn(Optional.of(testAuthor));
        when(authorMapper.toResponse(testAuthor)).thenReturn(testAuthorResponse);

        AuthorResponse result = authorService.findById(1L);

        assertThat(result.getFirstName()).isEqualTo("Gabriel");
    }

    @Test
    @DisplayName("findById should throw when not found")
    void findById_shouldThrow_whenNotFound() {
        when(authorRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authorService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("create should save author")
    void create_shouldSaveAuthor() {
        when(authorMapper.toEntity(testAuthorRequest)).thenReturn(testAuthor);
        when(authorRepository.save(testAuthor)).thenReturn(testAuthor);
        when(authorMapper.toResponse(testAuthor)).thenReturn(testAuthorResponse);

        AuthorResponse result = authorService.create(testAuthorRequest);

        assertThat(result).isNotNull();
        verify(authorRepository).save(testAuthor);
    }

    @Test
    @DisplayName("update should update author")
    void update_shouldUpdateAuthor() {
        when(authorRepository.findById(1L)).thenReturn(Optional.of(testAuthor));
        when(authorRepository.save(testAuthor)).thenReturn(testAuthor);
        when(authorMapper.toResponse(testAuthor)).thenReturn(testAuthorResponse);

        AuthorResponse result = authorService.update(1L, testAuthorRequest);

        assertThat(result).isNotNull();
        verify(authorMapper).updateEntity(testAuthorRequest, testAuthor);
    }

    @Test
    @DisplayName("delete should remove author")
    void delete_shouldRemoveAuthor() {
        when(authorRepository.findById(1L)).thenReturn(Optional.of(testAuthor));

        authorService.delete(1L);

        verify(authorRepository).delete(testAuthor);
    }
}
