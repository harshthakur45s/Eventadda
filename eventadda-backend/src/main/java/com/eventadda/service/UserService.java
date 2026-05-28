package com.eventadda.service;

import com.eventadda.model.User;
import com.eventadda.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email address already in use.");
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Ensure default role is PARTICIPANT if not defined or organizer
        if (user.getRole() == null || (!user.getRole().equals("ORGANIZER") && !user.getRole().equals("PARTICIPANT"))) {
            user.setRole("PARTICIPANT");
        }
        
        user.setEnabled(true);
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public User updateProfileImage(Long userId, String profileImageUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setProfileImage(profileImageUrl);
        return userRepository.save(user);
    }
}
