package com.example.website.service;

import com.example.website.dto.BookDTO;
import com.example.website.entity.BookEntity;
import com.example.website.response.PageBookResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BookService {
    PageBookResponse home(Integer page);
    BookEntity getBook(int id);
    BookEntity createBook(BookDTO bookDTO);
    BookEntity updateBook(int id,BookDTO bookDTO);
    void deleteBook(int id);

    PageBookResponse findByCondition(Integer page ,String title ,String author,List<Integer> categoryIds);
//    PageBookResponse findByAuthor(Integer page,String author);
//    PageBookResponse findByTitle(Integer page,String title);

    List<String> saveImages(MultipartFile[] imageFiles);
    String saveImage(MultipartFile imageFile);
}
