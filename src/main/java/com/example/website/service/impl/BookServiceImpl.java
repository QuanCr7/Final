package com.example.website.service.impl;

import com.example.website.dto.BookDTO;
import com.example.website.entity.BookEntity;
import com.example.website.entity.CategoryEntity;
import com.example.website.repository.BookRepository;
import com.example.website.repository.CategoryRepository;
import com.example.website.response.PageBookResponse;
import com.example.website.service.BookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    private final Path rootLocation = Paths.get("src/main/resources/static/images/book");

    private static final int size = 10;

    @Override
    public PageBookResponse home(Integer page) {
        int pageNumber = (page == null) ? 0 : page - 1;
        Pageable pageable = PageRequest.of(pageNumber, size);

        Page<BookEntity> entityPage = bookRepository.findAll(pageable);

        return PageBookResponse.builder()
                .currentPage(pageNumber + 1)
                .pageSize(entityPage.getSize())
                .totalPages(entityPage.getTotalPages())
                .totalElements(entityPage.getTotalElements())
                .books(entityPage.getContent())
                .build();
    }

    @Override
    public BookEntity getBook(int id) {
        return bookRepository.findById(id).orElseThrow(()-> new RuntimeException("Book Not Found"));
    }

    @Override
    public BookEntity createBook(BookDTO bookDTO) {
        if (bookRepository.existsByTitle(bookDTO.getTitle())) {
            throw new RuntimeException("Title Already Exists");
        }

        List<String> imageUrls = saveImages(bookDTO.getImages());

        BookEntity book = BookEntity.builder()
                .title(bookDTO.getTitle())
                .author(bookDTO.getAuthor())
                .price(bookDTO.getPrice())
                .description(bookDTO.getDescription())
                .post_date(LocalDate.now())
                .publisher(bookDTO.getPublisher())
                .images(imageUrls)
                .categories(new HashSet<>())
                .build();


        if (bookDTO.getCategories() != null) {
            for (Integer categoryId : bookDTO.getCategories()) {
                CategoryEntity category = categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
                book.getCategories().add(category);
                category.getBooks().add(book);
            }
        }
        return bookRepository.save(book);
    }

    @Override
    public BookEntity updateBook(int id, BookDTO bookDTO) {

        BookEntity book = getBook(id);
        List<String> imageUrls = (bookDTO.getImages() != null)
                ? saveImages(bookDTO.getImages())
                : new ArrayList<>();
        book.setTitle(bookDTO.getTitle());
        book.setAuthor(bookDTO.getAuthor());
        book.setPrice(bookDTO.getPrice());
        book.setDescription(bookDTO.getDescription());
        book.setPublisher(bookDTO.getPublisher());

        if (!imageUrls.isEmpty()) {
            book.setImages(imageUrls);
        }

        if (bookDTO.getCategories() != null) {
            for (CategoryEntity existingCategory : new HashSet<>(book.getCategories())) {
                existingCategory.getBooks().remove(book);
            }
            book.getCategories().clear();

            for (Integer categoryId : bookDTO.getCategories()) {
                CategoryEntity category = categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
                book.getCategories().add(category);
                category.getBooks().add(book);
            }
        }
        return bookRepository.save(book);
    }

    @Override
    public void deleteBook(int id) {
        BookEntity book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));

        for (CategoryEntity category : new HashSet<>(book.getCategories())) {
            category.getBooks().remove(book);
        }
        book.getCategories().clear();

        bookRepository.deleteById(id);
    }

    @Override
    public PageBookResponse findByCondition(Integer page, String title, String author,List<Integer> categoryIds) {
        int pageNumber = (page == null) ? 0 : page - 1;
        Pageable pageable = PageRequest.of(pageNumber, size);

        Long categoryCount = (categoryIds != null && !categoryIds.isEmpty()) ?
                (long) categoryIds.size() : null;

        Page<BookEntity> entityPage = bookRepository.searchByCondition(pageable,title,author, (categoryIds != null && !categoryIds.isEmpty()) ? categoryIds : null, categoryCount);

        return PageBookResponse.builder()
                .currentPage(pageNumber + 1)
                .pageSize(entityPage.getSize())
                .totalPages(entityPage.getTotalPages())
                .totalElements(entityPage.getTotalElements())
                .books(entityPage.getContent())
                .build();
    }

//    @Override
//    public PageBookResponse findByAuthor(Integer page,String author) {
//        int pageNumber = (page == null) ? 0 : page - 1;
//        Pageable pageable = PageRequest.of(pageNumber, size);
//
//        Page<BookEntity> entityPage = bookRepository.searchByAuthor(pageable, author);
//
//        return PageBookResponse.builder()
//                .currentPage(pageNumber + 1)
//                .pageSize(entityPage.getSize())
//                .totalPages(entityPage.getTotalPages())
//                .totalElements(entityPage.getTotalElements())
//                .books(entityPage.getContent())
//                .build();
//    }
//
//    @Override
//    public PageBookResponse findByTitle(Integer page,String title) {
//        int pageNumber = (page == null) ? 0 : page - 1;
//        Pageable pageable = PageRequest.of(pageNumber, size);
//
//        Page<BookEntity> entityPage = bookRepository.searchByTitle(pageable, title);
//
//        return PageBookResponse.builder()
//                .currentPage(pageNumber + 1)
//                .pageSize(entityPage.getSize())
//                .totalPages(entityPage.getTotalPages())
//                .totalElements(entityPage.getTotalElements())
//                .books(entityPage.getContent())
//                .build();
//    }

    @Override
    public List<String> saveImages(MultipartFile[] imageFiles) {
        List<String> imageNames = new ArrayList<>();

        if (imageFiles == null || imageFiles.length == 0) {
            return imageNames; // Trả về danh sách rỗng
        }


        for (MultipartFile imageFile : imageFiles) {
            String fileName = saveImage(imageFile);
            if (fileName != null) {
                imageNames.add(fileName);
            }
        }
        return imageNames;
    }

    @Override
    public String saveImage(MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String fileName = imageFile.getOriginalFilename();
                Path filePath = rootLocation.resolve(fileName);

                // Kiểm tra và tạo thư mục nếu chưa tồn tại
                Files.createDirectories(filePath.getParent());

                // Lưu file
                Files.write(filePath, imageFile.getBytes());

                return fileName;
            } catch (IOException e) {
//                e.printStackTrace();
//                throw new RuntimeException("Failed to save image file: " + e.getMessage(), e);
                log.error("Failed to save image file: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to save image file", e);
            }
        }
        return null;
    }
}
