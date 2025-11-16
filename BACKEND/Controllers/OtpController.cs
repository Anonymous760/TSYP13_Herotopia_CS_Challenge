using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SignatureAPP.Models;
using SignatureAPP.Services;
using System; 
using System.Threading.Tasks; 

namespace SignatureAPP.Controllers
{
    [Route("protected-resource/[controller]")]
    [ApiController]
    public class OtpController : ControllerBase
    {
        private readonly IOtpService _otpService;
        private readonly UserManager<AppUser> _userManager;
        private readonly ILogger<OtpController> _logger;

        public OtpController(IOtpService otpService, UserManager<AppUser> userManager, ILogger<OtpController> logger)
        {
            _otpService = otpService;
            _userManager = userManager;
            _logger = logger;
        }

        [HttpPost("addotp/{userid}")]
        public async Task<IActionResult> AddOTP(string userid)
        {
            try
            {
               
                if (userid==null)
                {
                    _logger.LogError($"[OtpController/AddOTP01] User Id is null ");
                    return BadRequest(new { message = "User is null." });
                }

                var user = await _userManager.FindByIdAsync(userid);
                if (user == null)
                {
                    _logger.LogError($"[OtpController/AddOTP02] User not found ");
                    return NotFound(new { message = "user not found" });
                }

                await _otpService.generateOTP(userid);
                _logger.LogInformation($"[OtpController/AddOTP03] OTP generated successfully. ");
                return Ok(new { message = "OTP generated successfully." }); 
            }
            catch (Exception ex)
            {
                _logger.LogError($"[OtpController/AddOTP04] Unexpected  Error: {ex.Message}");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpPost("addPassOtp/{userEmail}")]
        public async Task<IActionResult> AddPassOTP(string userEmail)
        {
            try
            {
               
                if (userEmail==null) 
                {
                    _logger.LogError($"[OtpController/AddPassOTP01] UserEmail is null ");
                    return BadRequest(new { message = "User email is null." });
                }

                var user = await _userManager.FindByEmailAsync(userEmail);
                if (user == null)
                {
                    _logger.LogError($"[OtpController/AddPassOTP02] User not found");
                    return NotFound(new { message = "user not found" });
                }

                await _otpService.generateOTP(user.Id);
                _logger.LogInformation($"[OtpController/AddPassOTP03] Password OTP generated successfully .");
                return Ok(new { message = "Password OTP generated successfully." }); 
            }
            catch (Exception ex)
            {
                _logger.LogError($"[OtpController/AddPassOTP04] Unexpected  Error: {ex.Message}");
                return StatusCode(500, new { message = "An unexpected error occurred " });
            }
        }

        [HttpGet("verify/{userid}/otp/{code}")]
        public async Task<IActionResult> verifyOTP(string userid, int code)
        {
            try
            {
               
                if (userid==null || code == null)
                {
                    _logger.LogError($"[OtpController/verifyOTP01] user or code is null");
                    return BadRequest(new { message = " user or code is null" });
                }
                

                var user = await _userManager.FindByIdAsync(userid);
                if (user == null)
                {
                    _logger.LogError($"[OtpController/verifyOTP02] User not found in DB");
                    return NotFound(new { message = "user not found" });
                }

                var otp = await _otpService.getOtp(code, userid);
                if (otp == null)
                {
                    _logger.LogError($"[OtpController/verifyOTP03]  OTP Code: {code} Invalid for UserID: {userid}.");
                    return BadRequest(new { message = "Invalid OTP" });
                }

                _logger.LogInformation($"[OtpController/verifyOTP04] OTP verified successfully");
                return Ok(new { message = "OTP verified successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[OtpController/verifyOTP06] Unexpected error : {ex.Message}");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpGet("verify/{Email}/Passotp/{code}")]
        public async Task<IActionResult> verifPassOTP(string Email, int code)
        {
            try
            {
               
                if (Email==null || code ==null)
                {
                    _logger.LogError($"[OtpController/verifPassOTP01] UserEmail or code  is null ");
                    return BadRequest(new { message = "User email or code is null" });
                }

                var user = await _userManager.FindByEmailAsync(Email);
                if (user == null)
                {
                    _logger.LogError($"[OtpController/verifPassOTP02] User not found in DB");
                    return NotFound(new { message = "user not found" });
                }

                var otp = await _otpService.getOtp(code, user.Id);
                if (otp == null)
                {
                    _logger.LogError($"[OtpController/verifPassOTP03] Invalid password OTP Code");
                    return BadRequest(new { message = "otp didn't found" }); 
                }

                _logger.LogInformation($"[OtpController/verifPassOTP04] Password OTP verified successfully.");
                return Ok(new { message = "Password OTP verified successfully." }); 
            }
            catch (Exception ex)
            {
                _logger.LogError($"[OtpController/verifPassOTP05] Unexpected  Error: {ex.Message}");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }
    }
}