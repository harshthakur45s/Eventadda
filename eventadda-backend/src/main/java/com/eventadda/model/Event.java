package com.eventadda.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank
    private String venue;

    @NotNull
    private LocalDateTime date;

    @Column(name = "ticket_price")
    private Double ticketPrice = 0.0;

    @NotNull
    @Column(name = "max_seats")
    private Integer maxSeats;

    @Column(name = "available_seats")
    private Integer availableSeats;

    @NotBlank
    private String category; // Tech, Music, Sports, Seminar, etc.

    @Column(name = "banner_image")
    private String bannerImage;

    private String status = "UPCOMING"; // UPCOMING, ONGOING, COMPLETED

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    public Event() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public Double getTicketPrice() { return ticketPrice; }
    public void setTicketPrice(Double ticketPrice) { this.ticketPrice = ticketPrice; }

    public Integer getMaxSeats() { return maxSeats; }
    public void setMaxSeats(Integer maxSeats) { this.maxSeats = maxSeats; }

    public Integer getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getBannerImage() { return bannerImage; }
    public void setBannerImage(String bannerImage) { this.bannerImage = bannerImage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public User getOrganizer() { return organizer; }
    public void setOrganizer(User organizer) { this.organizer = organizer; }
}
