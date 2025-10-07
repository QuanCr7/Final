package com.example.website.response;

import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private int commentId;
    private String comment;
    private int bookId;
    private int userId;
}
