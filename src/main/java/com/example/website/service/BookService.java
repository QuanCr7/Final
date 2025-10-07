package com.example.website.service;

import com.example.website.request.BookRequest;
import com.example.website.response.BookResponse;
import com.example.website.response.PageBookResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BookService {
    PageBookResponse home(Integer page);
    BookResponse getBook(int id);
    BookResponse createBook(BookRequest bookRequest);
    BookResponse updateBook(int id, BookRequest bookRequest);
    void deleteBook(int id);

    PageBookResponse findByCondition(Integer page ,String title ,String author,List<Integer> categoryIds);
//    PageBookResponse findByAuthor(Integer page,String author);
//    PageBookResponse findByTitle(Integer page,String title);

    List<String> saveImages(MultipartFile[] imageFiles);
    String saveImage(MultipartFile imageFile);
}
