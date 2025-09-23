package com.example.website.service.impl;

import com.example.website.dto.CommentDTO;
import com.example.website.entity.BookEntity;
import com.example.website.entity.CommentEntity;
import com.example.website.entity.UserEntity;
import com.example.website.repository.BookRepository;
import com.example.website.repository.CommentRepository;
import com.example.website.repository.UserRepository;
import com.example.website.service.CommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class CommentServiceImpl implements CommentService {
    private final CommentRepository commentRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @Override
    public List<CommentEntity> findAll() {
        return commentRepository.findAll();
    }

    @Override
    public List<CommentEntity> findAllByBook(String name) {
        String nameBook = getString(name);

        BookEntity book = bookRepository.findByTitle(nameBook).orElseThrow(()-> new RuntimeException("Book not found"));
        return commentRepository.findAllByBook(book);
    }

    @Override
    public CommentEntity getComment(int id) {
        return commentRepository.findById(id).orElseThrow(()-> new RuntimeException("Comment Not Found"));
    }

    @Override
    public CommentEntity addComment(String bookTittle,CommentDTO commentDTO) {
        String nameBook = getString(bookTittle);
        BookEntity book = bookRepository.findByTitle(nameBook).orElseThrow(()-> new RuntimeException("Book not found"));
        UserEntity user = userRepository.findById(commentDTO.getUserId()).orElseThrow(()-> new RuntimeException("User not found"));
        CommentEntity commentEntity = CommentEntity.builder()
                .comment(commentDTO.getComment())
                .book(book)
                .user(user)
                .createAt(LocalDate.now())
                .build();
        return commentRepository.save(commentEntity);
    }

    @Override
    public CommentEntity updateComment(int id, CommentDTO commentDTO) {
        CommentEntity commentEntity = getComment(id);
        commentEntity.setComment(commentDTO.getComment());
        return commentRepository.save(commentEntity);
    }

    @Override
    public void deleteComment(int id) {
        commentRepository.deleteById(id);
    }

    private static String getString(String name) {
        String formatted = name.replace("-", " ");
        return formatted;
    }
}
