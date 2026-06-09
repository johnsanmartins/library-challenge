package com.azurian.library.repository;

import com.azurian.library.domain.Loan;
import com.azurian.library.domain.LoanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    @Query("SELECT l FROM Loan l LEFT JOIN FETCH l.book LEFT JOIN FETCH l.client " +
           "WHERE l.status = :status")
    Page<Loan> findByStatus(@Param("status") LoanStatus status, Pageable pageable);

    @Query("SELECT l FROM Loan l LEFT JOIN FETCH l.book LEFT JOIN FETCH l.client")
    Page<Loan> findAllLoans(Pageable pageable);

    boolean existsByBookIdAndClientIdAndStatus(Long bookId, Long clientId, LoanStatus status);
}
