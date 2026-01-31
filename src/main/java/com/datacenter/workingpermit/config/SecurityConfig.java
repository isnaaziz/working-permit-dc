package com.datacenter.workingpermit.config;

import com.datacenter.workingpermit.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(Arrays.asList(
                                "http://localhost:5173",
                                "http://localhost:5174",
                                "http://localhost:3000",
                                "http://127.0.0.1:5173"));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                configuration.setAllowedHeaders(Arrays.asList("*"));
                configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http, @Lazy JwtAuthenticationFilter jwtAuthenticationFilter)
                        throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                .csrf(csrf -> csrf
                                                .ignoringRequestMatchers("/h2-console/**", "/api/**"))

                                .headers(headers -> headers
                                                .frameOptions(frame -> frame.sameOrigin()))

                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/",
                                                                "/index.html",
                                                                "/login.html",
                                                                "/register.html",
                                                                "/dashboard.html",
                                                                "/permits.html",
                                                                "/approvals.html",
                                                                "/access.html",
                                                                "/static/**",
                                                                "/css/**",
                                                                "/js/**",
                                                                "/images/**",
                                                                "/h2-console/**",
                                                                "/api/auth/**")
                                                .permitAll()

                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                                                .requestMatchers("/api/approvals/manager/**")
                                                .hasAnyRole("MANAGER", "ADMIN")
                                                .requestMatchers("/api/approvals/pic/**")
                                                .hasAnyRole("PIC", "MANAGER", "ADMIN", "ADMINISTRATOR_ODC",
                                                                "ADMINISTRATOR_INFRA", "ADMINISTRATOR_NETWORK")
                                                .requestMatchers("/api/access/**")
                                                .hasAnyRole("SECURITY", "ADMIN", "MANAGER", "PIC",
                                                                "ADMINISTRATOR_ODC", "ADMINISTRATOR_INFRA",
                                                                "ADMINISTRATOR_NETWORK")
                                                .requestMatchers("/api/**").authenticated()

                                                .anyRequest().permitAll())

                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}
