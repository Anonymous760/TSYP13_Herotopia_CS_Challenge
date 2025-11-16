using Azure.Core; 
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using SignatureAPP.Dto;
using SignatureAPP.Models;
using SignatureAPP.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore; 
using SignatureAPP.Data; 

using Microsoft.Extensions.Logging;
using System;
using System.Linq; 
using System.Threading.Tasks; 

namespace SignatureAPP.Controllers
{
    [Route("protected-resource/[controller]")]
    [ApiController]
    public class AuthenController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AuthenController> _logger;

        public AuthenController(
            UserManager<AppUser> userManager,
            SignInManager<AppUser> signInManager,
            IConfiguration configuration,
            IEmailService emailService,
            ITokenService tokenService,
            ILogger<AuthenController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _emailService = emailService;
            _tokenService = tokenService;
            _logger = logger;
        }

        [HttpPost("CreateUser")]
        public async Task<IActionResult> CreateUser([FromQuery] string email)
        {
            try
            {
                

                if (email==null)
                {
                    _logger.LogError($"[AuthenController/CreateUser01] Email is null");
                    return BadRequest(new { message = "Email is null" });
                }

                var userExist = await _userManager.FindByEmailAsync(email);
                if (userExist == null)
                {
                    var user = new AppUser
                    {
                        UserName = email,
                        Email = email,
                        roles = "User", 
                        status = "TEMPORARY_CREATED",
                        EmailConfirmed = false
                    };

                    var result = await _userManager.CreateAsync(user);
                    if (!result.Succeeded)
                    {
                        
                        _logger.LogError($"[AuthenController/CreateUser02] Failed to create user");
                        return BadRequest(new { message = "User not created" });
                    }

                    await _userManager.AddToRoleAsync(user, "User");
                    var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                    await _emailService.SendVerificationEmail(user.Email, "Mr Foulen fouleni", token); 

                    _logger.LogInformation($"[AuthenController/CreateUser03]   user created and  Verification email sent.");
                }
                else
                {
                    if (userExist.status == "Created")
                    {
                        _logger.LogError($"[AuthenController/CreateUser04] User  already  registered.");
                        return BadRequest(new { message = "User already registered" });
                    }
                   
                    var token = await _userManager.GenerateEmailConfirmationTokenAsync(userExist);
                    await _emailService.SendVerificationEmail(userExist.Email, "Mr Foulen fouleni", token);
                    _logger.LogInformation($"[AuthenController/CreateUser05] Email confirmation resent to existing user");
                }

                return Ok(new { message = " user created and  Verification email sent." }); 
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthenController/CreateUser06] Unexpected  Error: {ex.Message}");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        [HttpPost("{email}/Registre")]
        public async Task<IActionResult> Registre(string email, [FromBody] RegistreDto model)
        {
            try
            {
               
                if (!ModelState.IsValid)
                {
                    
                    _logger.LogError($"[AuthenController/Registre01] Invalid model ");
                    return BadRequest(new { message = "Invalid model" });
                }

                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    _logger.LogError($"[AuthenController/Registre02] User not found in DB");
                    return NotFound(new { message = "User not found" });
                }

                if (!user.EmailConfirmed)
                {
                    _logger.LogError($"[AuthenController/Registre03] User  email not confirmed ");
                    return BadRequest(new { message = "Email not yet confirmed" });
                }

                if (user.status == "Created")
                {
                    _logger.LogError($"[AuthenController/Registre04] User already fully registered");
                    return BadRequest(new { message = "User already fully registered" });
                }

                user.firstName = model.firstName;
                user.lastName = model.lastName;
                user.PhoneNumber = model.NumeroTel;
                
                user.status = "Created";

                
                if (await _userManager.HasPasswordAsync(user))
                {
                    var removemdp = await _userManager.RemovePasswordAsync(user);
                    if (!removemdp.Succeeded)
                    {
                       
                        _logger.LogError($"[AuthenController/Registre05] Failed to remove the existing password in DB ");
                       
                        return BadRequest(new { message = "Could not Add  password"});
                    }
                }

                var addPsw = await _userManager.AddPasswordAsync(user, model.Password);
                if (!addPsw.Succeeded)
                {
                    
                    _logger.LogError($"[AuthenController/Registre06] Failed to add the new password ");
                    return BadRequest(new { message = "Could not add password" });
                }

                var update = await _userManager.UpdateAsync(user);
                if (!update.Succeeded)
                {
                   
                    _logger.LogError($"[AuthenController/Registre07] Failed to update user ");
                    return BadRequest(new { message = "Failed to register the user" });
                }

                _logger.LogInformation($"[AuthenController/Registre08] User fully registered");
                return Ok(new { message = "User fully registered" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthenController/Registre09] Unexpected  Error: {ex.Message}");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        [HttpGet("ConfirmEmail")]
        public async Task<IActionResult> ConfirmEmail(string email, string token)
        {
            try
            {
               
                if (email==null || token ==null)
                {
                    _logger.LogError($"[AuthenController/ConfirmEmail01] Invalid token or email.");
                    return BadRequest(new { message = "Invalid token or email." });
                }

                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    _logger.LogError($"[AuthenController/ConfirmEmail02] User not found by email");
                    return BadRequest(new { message = "User not found." }); 
                }

                var result = await _userManager.ConfirmEmailAsync(user, token);
                if (result.Succeeded)
                {
                    _logger.LogInformation($"[AuthenController/ConfirmEmail03] Email confirmed successfully ");
                    return Ok(new { message = "Email confirmed successfully." });
                }

               
                _logger.LogError($"[AuthenController/ConfirmEmail04] Email confirmation failed");
                return BadRequest(new { message = "Email confirmation failed." });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthenController/ConfirmEmail05] Unexpected  Error: {ex.Message}");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            try
            {
                
                if (!ModelState.IsValid)
                {
                    
                    _logger.LogError($"[AuthenController/Login01] Invalid login model .");
                    return BadRequest(new { message = "Invalid  request" });
                }

                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                {
                    _logger.LogError($"[AuthenController/Login02] User not found in DB");
                    return NotFound(new { message = "User Not Found" }); 
                }

                if (!user.EmailConfirmed)
                {
                    _logger.LogError($"[AuthenController/Login03] Email not confirmed yet in DB");
                    return BadRequest(new { message = "Please verify your email first" });
                }

                var result = await _signInManager.PasswordSignInAsync(user.UserName, model.Password,  false,  false);
                if (!result.Succeeded)
                {
                    _logger.LogError($"[AuthenController/Login04]  login failer for user  ");
                    return BadRequest(new { message = "Invalid Login" });
                }
                var roles = await _userManager.GetRolesAsync(user);
                var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.Email),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

                foreach (var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }

                var token = _tokenService.GenerateTokenAcces(claims);

                _logger.LogInformation($"[AuthenController/Login05] Successful login ");
                return Ok(new { token });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthenController/Login06] Unexpected   Error: {ex.Message}");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }
    }
}