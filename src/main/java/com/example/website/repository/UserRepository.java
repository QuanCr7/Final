package com.example.website.repository;

import com.example.website.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Integer> {
    Boolean existsById(int id);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    Boolean existsByPhone(String phone);

    Optional<UserEntity> findById(Integer id);
    Optional<UserEntity> findByUsername(String username);

    UserEntity findByEmail(String email);
    UserEntity findByPasswordToken(String passwordToken);

    @Query("SELECT u FROM UserEntity u")
    Page<UserEntity> findAll(Pageable pageable);

    @Query("SELECT u FROM UserEntity u WHERE" +
            "(:name IS NULL OR u.username LIKE %:name%) AND " +
            "(:email IS NULL OR u.email LIKE %:email%) AND" +
            "(:id IS NULL OR u.id = :id) AND" +
            "(:phone IS NULL OR u.phone LIKE %:phone%)")
    Page<UserEntity> searchByCondition(Pageable pageable, String name, String email,Integer id, String phone);

    Optional<UserEntity> findByUsernameAndRefreshToken(String username, String refreshToken);
}
