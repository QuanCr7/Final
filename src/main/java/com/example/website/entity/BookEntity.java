package com.example.website.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name="books")
public class BookEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "book_id")
    private int id;

    @Column(nullable = false)
    private String title;
    @Column(nullable = false)
    private String author;
    @Column(nullable = false)
    private double price;
    @Column(nullable = false)
    private String description;
    @Column(nullable = false)
    private LocalDate post_date;
    @Column(nullable = false)
    private String publisher;

    @ElementCollection
    @CollectionTable(name = "book_image", joinColumns = @JoinColumn(name = "book_id"))
    @Column(nullable = false)
    private List<String> images;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<OrderDetailEntity> orderDetails;

    @ManyToMany(mappedBy = "books", cascade = CascadeType.REMOVE)
    private Set<CategoryEntity> categories;

    @OneToMany(mappedBy = "book", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore
    private List<CommentEntity> comments;

}
