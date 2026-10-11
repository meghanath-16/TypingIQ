package com.typingiq.service;

import com.typingiq.dto.AuthResponse;
import com.typingiq.dto.LoginRequest;
import com.typingiq.dto.RegisterRequest;
import com.typingiq.dto.UserDto;
import com.typingiq.entity.User;
import com.typingiq.exception.BadRequestException;
import com.typingiq.repository.UserRepository;
import com.typingiq.security.JwtTokenProvider;
import com.typingiq.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername().trim())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(req.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User(
                req.getUsername().trim(),
                req.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(req.getPassword()),
                "ROLE_USER"
        );
        User savedUser = userRepository.save(user);

        // Authenticate immediately upon successful registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername().trim(), req.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        return new AuthResponse(jwt, UserDto.fromEntity(savedUser));
    }

    public AuthResponse login(LoginRequest req) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsernameOrEmail().trim(), req.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("User record not found"));

        return new AuthResponse(jwt, UserDto.fromEntity(user));
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            return getOrCreateGuestUser();
        }
        return userRepository.findById(principal.getId())
                .orElseGet(this::getOrCreateGuestUser);
    }

    public User getOrCreateGuestUser() {
        return userRepository.findByUsername("guest")
                .orElseGet(() -> userRepository.save(
                        new User("guest", "guest@typingiq.local", passwordEncoder.encode("Guest123!"), "ROLE_USER")
                ));
    }
}
