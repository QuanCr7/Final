package com.example.website.service.impl;

import com.example.website.configuration.CustomUserDetails;
import com.example.website.entity.BookEntity;
import com.example.website.entity.CommentEntity;
import com.example.website.entity.UserEntity;
import com.example.website.repository.BookRepository;
import com.example.website.repository.CommentRepository;
import com.example.website.repository.UserRepository;
import com.example.website.request.CommentRequest;
import com.example.website.response.CommentResponse;
import com.example.website.response.PageCommentResponse;
import com.example.website.service.CommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Slf4j
@RequiredArgsConstructor
@Service
public class CommentServiceImpl implements CommentService {
    private final CommentRepository commentRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    private static final int size = 10;

    @Override
    public PageCommentResponse findAll(Integer page) {
        int pageNumber = (page == null) ? 0 : page - 1;
        Pageable pageable = PageRequest.of(pageNumber, size);

        Page<CommentEntity> entityPage = commentRepository.findAll(pageable);
        Page<CommentResponse> responsePage = entityPage.map(this::response);

        return PageCommentResponse.builder()
                .currentPage(pageNumber + 1)
                .pageSize(responsePage.getSize())
                .totalPages(responsePage.getTotalPages())
                .totalElements(responsePage.getTotalElements())
                .comments(responsePage.getContent())
                .build();
    }

    @Override
    public PageCommentResponse findAllByBook(Integer page,String name) {
        String nameBook = getString(name);
        BookEntity book = bookRepository.findByTitle(nameBook)
                .orElseThrow(() -> new RuntimeException("Book not found with title: " + nameBook));

        int pageNumber = (page == null) ? 0 : page - 1;
        Pageable pageable = PageRequest.of(pageNumber, size);

        Page<CommentEntity> entityPage = commentRepository.findAllByBook(book, pageable);
        Page<CommentResponse> responsePage = entityPage.map(this::response);

        return PageCommentResponse.builder()
                .currentPage(pageNumber + 1)
                .pageSize(responsePage.getSize())
                .totalPages(responsePage.getTotalPages())
                .totalElements(responsePage.getTotalElements())
                .comments(responsePage.getContent())
                .build();
    }

    @Override
    public CommentEntity getComment(int id) {
        return commentRepository.findById(id).orElseThrow(()-> new RuntimeException("Comment Not Found"));
    }

    @Override
    public CommentResponse addComment(CommentRequest commentRequest) {

        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Integer userId = userDetails.getId();
        if (userId == null) {
            throw new RuntimeException("User not authenticated");
        }

        BookEntity book = bookRepository.findById(commentRequest.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + commentRequest.getBookId()));
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        CommentEntity comment = CommentEntity.builder()
                .comment(commentRequest.getComment())
                .createAt(LocalDate.now())
                .book(book)
                .user(user)
                .build();

        return response(commentRepository.save(comment));
    }

    @Override
    public void deleteComment(int id) {
        commentRepository.deleteById(id);
    }

    public CommentResponse response(CommentEntity response) {
        return CommentResponse.builder()
                .commentId(response.getId())
                .comment(response.getComment())
                .bookId(response.getBook().getId())
                .userId(response.getUser().getId())
                .build();
    }

    private static String getString(String name) {
        return name.replace("-", " ");
    }
}
