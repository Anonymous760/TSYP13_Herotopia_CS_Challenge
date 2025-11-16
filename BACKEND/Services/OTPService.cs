using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SignatureAPP.Data;
using SignatureAPP.Models;

namespace SignatureAPP.Services
{
    public class OTPService : IOtpService
    {
        private readonly DbContextClass _dbContext;
        private readonly IEmailService _emailService;
        private readonly UserManager<AppUser> _userManager;
        private readonly ILogger<OTPService> _logger;

        public OTPService(
            DbContextClass dbContext,
            IEmailService emailService,
            UserManager<AppUser> userManager,
            ILogger<OTPService> logger)
        {
            _dbContext = dbContext;
            _emailService = emailService;
            _userManager = userManager;
            _logger = logger;
        }

        public async Task generateOTP(string userId)
        {
            try
            {
                if (userId==null)
                {
                    _logger.LogError("[OTPService/generateOTP01] User ID is null ");
                    return;
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    _logger.LogError($"[OTPService/generateOTP02] No user found ");
                    return;
                }

                int otpCode = new Random().Next(1000, 9999);
                var otp = new OTP
                {
                    OTPcode = otpCode,
                    userId = userId,
                    userSeen = false,
                    ExpiredTime = DateTime.UtcNow.AddHours(1).AddMinutes(10)
                };

                await _dbContext.Otps.AddAsync(otp);
                await _dbContext.SaveChangesAsync();

                _emailService.sendOTP(user.Email, otpCode);
                _logger.LogInformation($"[OTPService/generateOTP03] OTP generated and sent to email: {user.Email}.");
            }
            catch (Exception ex)
            {
                _logger.LogError($"[OTPService/generateOTP04] Unexpected  Error: {ex.Message}");
                throw;
            }
        }

        public async Task<OTP> getOtp(int code, string userId)
        {
            try
            {
                if (userId==null)
                {
                    _logger.LogError("[OTPService/getOtp01] User ID is null ");
                    return null;
                }

                var otp = await _dbContext.Otps
                    .Where(x => x.userId == userId && x.OTPcode == code)
                    .FirstOrDefaultAsync();

                if (otp == null)
                {
                    _logger.LogError($"[OTPService/getOtp02] No  OTP found for user ID: {userId} and code: {code}.");
                    return null;
                }

                if (otp.ExpiredTime >= DateTime.UtcNow.AddHours(1) && !otp.userSeen)
                {
                    otp.userSeen = true;
                    await _dbContext.SaveChangesAsync();
                    _logger.LogInformation($"[OTPService/getOtp03] OTP validated successfully");
                    return otp;
                }

                _logger.LogError($"[OTPService/getOtp04] OTP verification failed ");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError($"[OTPService/getOtp05] Unexpected  Error: {ex.Message}");
                throw;
            }
        }
    }
}
