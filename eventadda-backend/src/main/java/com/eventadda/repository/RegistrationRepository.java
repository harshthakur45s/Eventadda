package com.eventadda.repository;

import com.eventadda.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByUserId(Long userId);
    List<Registration> findByEventId(Long eventId);
    List<Registration> findByEventOrganizerId(Long organizerId);
    Boolean existsByUserIdAndEventId(Long userId, Long eventId);
    Optional<Registration> findByUserIdAndEventId(Long userId, Long eventId);
    List<Registration> findByUserIdAndStatus(Long userId, String status);
}
