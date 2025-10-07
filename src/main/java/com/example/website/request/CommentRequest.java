package com.example.website.request;

import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequest {
    private String comment;
    private int bookId;
    private int userId;
}
