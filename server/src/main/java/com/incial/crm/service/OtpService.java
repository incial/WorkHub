package com.incial.crm.service;

import com.incial.crm.entity.Otp;
import com.incial.crm.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private static final SecureRandom random = new SecureRandom();
    private static final int OTP_EXPIRY_MINUTES = 10;

    public String generateAndSendOtp(String email) {
        // Delete any existing OTPs for this email
        deleteOtpsByEmail(email);

        // Generate a 6-digit OTP
        String otpCode = String.format("%06d", random.nextInt(1000000));

        // Save OTP to database
        Otp otp = Otp.builder()
                .email(email)
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .verified(false)
                .build();
        otpRepository.save(otp);

        // Send OTP via email
        emailService.sendOtpEmail(email, otpCode);

        return otpCode;
    }

    public boolean verifyOtp(String email, String otpCode) {
        Optional<Otp> otpOptional = otpRepository.findByEmailAndOtpCodeAndVerifiedFalseAndExpiresAtAfter(
                email, otpCode, LocalDateTime.now());

        if (otpOptional.isPresent()) {
            Otp otp = otpOptional.get();
            otp.setVerified(true);
            otpRepository.save(otp);
            return true;
        }
        return false;
    }

    @Transactional
    public void deleteOtpsByEmail(String email) {
        otpRepository.deleteByEmail(email);
    }

    @Transactional
    public void deleteExpiredOtps() {
        otpRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}
