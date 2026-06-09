package com.azurian.library.repository;

import com.azurian.library.domain.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByIsbn(String isbn);

    boolean existsByIsbn(String isbn);

    // Query para búsqueda con texto - solo cuando search no es null
    @Query("SELECT b FROM Book b LEFT JOIN FETCH b.category LEFT JOIN FETCH b.authors " +
           "WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(b.isbn) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Book> findBySearch(@Param("search") String search, Pageable pageable);

    @Query("SELECT b FROM Book b LEFT JOIN FETCH b.category LEFT JOIN FETCH b.authors")
    Page<Book> findAllBooks(Pageable pageable);

    @Query("SELECT b FROM Book b LEFT JOIN FETCH b.category LEFT JOIN FETCH b.authors WHERE b.id = :id")
    Optional<Book> findByIdWithDetails(@Param("id") Long id);
}
