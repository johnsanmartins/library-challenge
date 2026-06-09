package com.azurian.library.mapper;

import com.azurian.library.domain.Loan;
import com.azurian.library.dto.response.LoanResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {BookMapper.class, ClientMapper.class})
public interface LoanMapper {

    LoanResponse toResponse(Loan loan);
}
