package com.eventadda.repository;

import com.eventadda.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByOrganizerId(Long organizerId);
    List<Event> findByCategory(String category);
    List<Event> findByStatus(String status);
    List<Event> findByTitleContainingIgnoreCaseOrVenueContainingIgnoreCaseOrCategoryContainingIgnoreCase(
        String title, String venue, String category
    );
}
