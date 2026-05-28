package com.eventadda.repository;

import com.eventadda.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUserId(Long userId);
    Boolean existsByUserIdAndEventId(Long userId, Long eventId);
    Optional<Wishlist> findByUserIdAndEventId(Long userId, Long eventId);
    List<Wishlist> findByEventId(Long eventId);
}
