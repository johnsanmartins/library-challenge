package com.azurian.library.service;

import com.azurian.library.domain.Author;
import com.azurian.library.domain.Book;
import com.azurian.library.domain.Category;
import com.azurian.library.dto.request.BookRequest;
import com.azurian.library.dto.response.BookResponse;
import com.azurian.library.dto.response.CategoryResponse;
import com.azurian.library.exception.BusinessException;
import com.azurian.library.exception.ResourceNotFoundException;
import com.azurian.library.mapper.BookMapper;
import com.azurian.library.repository.AuthorRepository;
import com.azurian.library.repository.BookRepository;
import com.azurian.library.repository.CategoryRepository;
import com.azurian.library.service.impl.BookServiceImpl;
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

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookService Unit Tests")
class BookServiceImplTest {

    @Mock
    private BookRepository bookRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private AuthorRepository authorRepository;
    @Mock
    private BookMapper bookMapper;

    @InjectMocks
    private BookServiceImpl bookService;

    private Book testBook;
    private BookResponse testBookResponse;
    private BookRequest testBookRequest;
    private Category testCategory;
    private Author testAuthor;

    @BeforeEach
    void setUp() {
        testCategory = Category.builder().id(1L).name("Fiction").build();
        testAuthor = Author.builder().id(1L).firstName("Gabriel").lastName("García Márquez").build();

        testBook = Book.builder()
                .id(1L)
                .title("Cien años de soledad")
                .isbn("978-0060883287")
                .publishedYear(1967)
                .availableCopies(3)
                .category(testCategory)
                .authors(new HashSet<>(Set.of(testAuthor)))
                .build();

        CategoryResponse categoryResponse = new CategoryResponse();
        categoryResponse.setId(1L);
        categoryResponse.setName("Fiction");

        testBookResponse = new BookResponse();
        testBookResponse.setId(1L);
        testBookResponse.setTitle("Cien años de soledad");
        testBookResponse.setIsbn("978-0060883287");
        testBookResponse.setCategory(categoryResponse);

        testBookRequest = new BookRequest();
        testBookRequest.setTitle("Cien años de soledad");
        testBookRequest.setIsbn("978-0060883287");
        testBookRequest.setAvailableCopies(3);
        testBookRequest.setCategoryId(1L);
        testBookRequest.setAuthorIds(Set.of(1L));
    }

    @Test
    @DisplayName("findAll should return paginated books")
    void findAll_shouldReturnPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Book> bookPage = new PageImpl<>(List.of(testBook));
        when(bookRepository.findAllBooks(pageable)).thenReturn(bookPage);
        when(bookMapper.toResponse(testBook)).thenReturn(testBookResponse);

        Page<BookResponse> result = bookService.findAll(null, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(bookRepository).findAllBooks(pageable);
    }

    @Test
    @DisplayName("findAll with search should filter by term")
    void findAll_withSearch_shouldFilter() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Book> bookPage = new PageImpl<>(List.of(testBook));
        when(bookRepository.findBySearch("Cien", pageable)).thenReturn(bookPage);
        when(bookMapper.toResponse(testBook)).thenReturn(testBookResponse);

        Page<BookResponse> result = bookService.findAll("Cien", pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(bookRepository).findBySearch("Cien", pageable);
    }

    @Test
    @DisplayName("findById should return book when found")
    void findById_shouldReturnBook_whenFound() {
        when(bookRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(testBook));
        when(bookMapper.toResponse(testBook)).thenReturn(testBookResponse);

        BookResponse result = bookService.findById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Cien años de soledad");
    }

    @Test
    @DisplayName("findById should throw when not found")
    void findById_shouldThrow_whenNotFound() {
        when(bookRepository.findByIdWithDetails(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("create should save and return book")
    void create_shouldSaveBook() {
        when(bookRepository.existsByIsbn(testBookRequest.getIsbn())).thenReturn(false);
        when(bookMapper.toEntity(testBookRequest)).thenReturn(testBook);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(authorRepository.findAllById(Set.of(1L))).thenReturn(List.of(testAuthor));
        when(bookRepository.save(testBook)).thenReturn(testBook);
        when(bookMapper.toResponse(testBook)).thenReturn(testBookResponse);

        BookResponse result = bookService.create(testBookRequest);

        assertThat(result).isNotNull();
        verify(bookRepository).save(testBook);
    }

    @Test
    @DisplayName("create should throw when ISBN already exists")
    void create_shouldThrow_whenIsbnExists() {
        when(bookRepository.existsByIsbn(testBookRequest.getIsbn())).thenReturn(true);

        assertThatThrownBy(() -> bookService.create(testBookRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    @DisplayName("create should throw when category not found")
    void create_shouldThrow_whenCategoryNotFound() {
        when(bookRepository.existsByIsbn(any())).thenReturn(false);
        when(bookMapper.toEntity(testBookRequest)).thenReturn(testBook);
        when(categoryRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.create(testBookRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("1");
    }

    @Test
    @DisplayName("create should throw when author IDs are invalid")
    void create_shouldThrow_whenAuthorIdsInvalid() {
        when(bookRepository.existsByIsbn(any())).thenReturn(false);
        when(bookMapper.toEntity(testBookRequest)).thenReturn(testBook);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(authorRepository.findAllById(any())).thenReturn(List.of());

        assertThatThrownBy(() -> bookService.create(testBookRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("invalid");
    }

    @Test
    @DisplayName("update should update and return book")
    void update_shouldUpdateBook() {
        when(bookRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(testBook));
        when(bookRepository.existsByIsbn(any())).thenReturn(false);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(authorRepository.findAllById(any())).thenReturn(List.of(testAuthor));
        when(bookRepository.save(testBook)).thenReturn(testBook);
        when(bookMapper.toResponse(testBook)).thenReturn(testBookResponse);

        BookResponse result = bookService.update(1L, testBookRequest);

        assertThat(result).isNotNull();
        verify(bookRepository).save(testBook);
    }

    @Test
    @DisplayName("update should throw when book not found")
    void update_shouldThrow_whenNotFound() {
        when(bookRepository.findByIdWithDetails(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.update(99L, testBookRequest))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("delete should remove book")
    void delete_shouldRemoveBook() {
        when(bookRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(testBook));

        bookService.delete(1L);

        verify(bookRepository).delete(testBook);
    }

    @Test
    @DisplayName("delete should throw when book not found")
    void delete_shouldThrow_whenNotFound() {
        when(bookRepository.findByIdWithDetails(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.delete(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
