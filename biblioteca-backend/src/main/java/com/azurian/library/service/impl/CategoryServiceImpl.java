package com.azurian.library.service.impl;

import com.azurian.library.domain.Category;
import com.azurian.library.dto.request.CategoryRequest;
import com.azurian.library.dto.response.CategoryResponse;
import com.azurian.library.exception.BusinessException;
import com.azurian.library.exception.ResourceNotFoundException;
import com.azurian.library.mapper.CategoryMapper;
import com.azurian.library.repository.CategoryRepository;
import com.azurian.library.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public Page<CategoryResponse> findAll(String search, Pageable pageable) {
        log.debug("Finding all categories with search='{}', pageable={}", search, pageable);
        if (search != null && !search.isBlank()) {
            return categoryRepository.findByNameContainingIgnoreCase(search, pageable)
                    .map(categoryMapper::toResponse);
        }
        return categoryRepository.findAll(pageable).map(categoryMapper::toResponse);
    }

    @Override
    public CategoryResponse findById(Long id) {
        log.debug("Finding category by id={}", id);
        return categoryMapper.toResponse(findCategoryOrThrow(id));
    }

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        log.info("Creating category with name='{}'", request.getName());
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new BusinessException("Category with name '" + request.getName() + "' already exists");
        }
        Category saved = categoryRepository.save(categoryMapper.toEntity(request));
        log.info("Category created with id={}", saved.getId());
        return categoryMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        log.info("Updating category id={}", id);
        Category category = findCategoryOrThrow(id);
        if (!category.getName().equalsIgnoreCase(request.getName())
                && categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new BusinessException("Category with name '" + request.getName() + "' already exists");
        }
        categoryMapper.updateEntity(request, category);
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        log.info("Deleting category id={}", id);
        Category category = findCategoryOrThrow(id);
        if (!category.getBooks().isEmpty()) {
            throw new BusinessException("Cannot delete category with associated books");
        }
        categoryRepository.delete(category);
    }

    private Category findCategoryOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }
}
