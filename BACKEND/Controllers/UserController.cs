using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging; 
using SignatureAPP.Dto;
using SignatureAPP.Models;
using SignatureAPP.Services;
using System; 
using System.Linq; 
using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks; 


namespace SignatureAPP.Controllers
{
    [Route("protected-resource/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "User")]
    public class UserController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IEmailService _emailService;
      
        private readonly ILogger<UserController> _logger; 

        public UserController(UserManager<AppUser> userManager, IEmailService emailService, ILogger<UserController> logger)
        {
            _userManager = userManager;
            _emailService = emailService;
           
            _logger = logger; 
        }

        //[HttpGet("GetALL")]
        //public async Task<IActionResult> GetUsers()
        //{
        //    try
        //    {
               
        //        var users = await _userManager.Users.ToListAsync();

        //        if (users == null || !users.Any())
        //        {
        //            _logger.LogWarning($"[UserController/GetUsers01] No users found.");
        //            return NotFound(new { message = "No users found." });
        //        }
        //        _logger.LogInformation($"[UserController/GetUsers03] Successfully retrieved {users.Count()} users.");
        //        return Ok(users);
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError($"[UserController/GetUsers04] Unexpected error: {ex.Message}");
        //        return StatusCode(500, new { message = "An unexpected error occurred." });
        //    }
        //}

        [HttpGet]
        public async Task<IActionResult> GetUserByEmail()
        {
            try
            {
                var userEmail = User.FindFirstValue(ClaimTypes.Email);
              

                if (userEmail==null)
                {
                    _logger.LogError($"[UserController/GetUserByEmail01] User email  not found in token.");
                    return Unauthorized(new { message = "User email not found in token." });
                }

                var user = await _userManager.FindByEmailAsync(userEmail);

                if (user == null)
                {
                    _logger.LogError($"[UserController/GetUserByEmail02] User not found  email: {userEmail}.");
                    return NotFound("User not found");
                }

                _logger.LogInformation($"[UserController/GetUserByEmail03]  retrieved user Successfully");
                return Ok(new
                {
                    user.firstName,
                    user.lastName,
                    user.Email,
                    user.PhoneNumber
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[UserController/GetUserByEmail04] Unexpected error: {ex.Message}");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        [HttpPost("ChangePasword")]

        public async Task<IActionResult> PasswordChange([FromBody] ChangePasswordDto model)
        {
            try
            {
               
                if (!ModelState.IsValid)
                {
                    _logger.LogError($"[UserController/PasswordChange01] Invalid model");
                    return BadRequest(new { message = " Invalid model" });
                }

                var userEmail = User.FindFirstValue(ClaimTypes.Email);
                if (userEmail==null)
                {
                    _logger.LogError($"[UserController/PasswordChange02] User email  not found in token ");
                    return Unauthorized(new { message = "User email not found in token." });
                }

                var user = await _userManager.FindByEmailAsync(userEmail);
                if (user == null)
                {
                    _logger.LogError($"[UserController/PasswordChange03] User not found  email: {userEmail}");
                    return NotFound(new { message = "user not found" });
                }

                bool check = await _userManager.CheckPasswordAsync(user, model.CurrentPassword);
                if (!check)
                {
                    _logger.LogError($"[UserController/PasswordChange04]  current password Incorrect");
                    return BadRequest(new { message = "current password Incorrect" });
                }

                var change = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
                if (!change.Succeeded)
                {
                   
                    _logger.LogError($"[UserController/PasswordChange05] Password change failed ");
                    return BadRequest(new { message = $"change pasword failed" });
                }

                _logger.LogInformation($"[UserController/PasswordChange06] Password changed successfully ");
                return Ok(new { message = "Password changed successfully " });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[UserController/PasswordChange07] Unexpected error: {ex.Message}");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }
        [AllowAnonymous]

        [HttpPut("newpassword")]
        public async Task<IActionResult> newpassword([FromBody] NewPasswordDto model)
        {
            try
            {
               
                if (model.email == null || model.newpass == null)
                {
                    _logger.LogError($"[UserController/newpassword01] email  or new password is null  ");
                    return BadRequest(new
                    {
                        message = "model not valid "
                    });
                }
                var email = model.email;
                var newPass = model.newpass;
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    _logger.LogError($"[UserController/newpassword02] user not found in DB ");
                    return NotFound(new
                    {
                        message = "user not found "
                    });
                }
                if (user.status == "TEMPORARY_CREATED")
                {
                    _logger.LogError($"[UserController/newpassword03] compte not verified ");
                    return BadRequest(new { message = " compte not verified, create user again  " });
                }
                if (await _userManager.HasPasswordAsync(user))
                {
                    var removemdp = await _userManager.RemovePasswordAsync(user);
                    if (!removemdp.Succeeded)
                    {

                        _logger.LogError($"[UserController/newpassword04] Failed to remove  password  ");
                        return BadRequest(new { message = "failed of changing existing password" });
                    }
                }
                var addPsw = await _userManager.AddPasswordAsync(user, newPass);
                if (!addPsw.Succeeded)
                {

                    _logger.LogError($"[UserController/newpassword05] Failed to add new password ");
                    return BadRequest(new { message = "Could not set password" });
                }

                var update = await _userManager.UpdateAsync(user);
                if (!update.Succeeded)
                {

                    _logger.LogError($"[UserController/newpassword06] Failed to update password ");
                    return BadRequest(new { message = "User not updated" });
                }

                _logger.LogInformation($"[UserController/newpassword07] password is modifid");
                return Ok(new { message = "password is modifid" });


            }
            catch(Exception ex) {
                _logger.LogError($"[UserController/newpassword08] Unexpected error: {ex.Message}");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        [HttpPut("updateuser")]
        public async Task<IActionResult> updateuser([FromBody] UpdateUserDto model)
        {
            try
            {
                
                if (!ModelState.IsValid) 
                {
                    _logger.LogError($"[UserController/updateuser01] Invalid model ");
                    return BadRequest(new { message = "Invalid model" }); 
                }

                var useremail = User.FindFirstValue(ClaimTypes.Email);
                if (useremail==null)
                {
                    _logger.LogError($"[UserController/updateuser02] User email  not found in token");
                    return Unauthorized(new { message = "User email not found in token." });
                }

                var user = await _userManager.FindByEmailAsync(useremail);
                if (user == null)
                {
                    _logger.LogWarning($"[UserController/updateuser03] User not found  email: {useremail}");
                    return NotFound(new { message = "user not found" });
                }

                
                user.Email = model.email;
                user.UserName = model.email; 
                user.lastName = model.prenom; 
                user.firstName = model.nom;   
                user.PhoneNumber = model.telephone;


                var result = await _userManager.UpdateAsync(user);
                if (result.Succeeded)
                {
                    _logger.LogInformation($"[UserController/updateuser04] User  updated successfully.");
                    
                    return Ok(new { message = "User updated successfully." }); 
                }
                else
                {
                    
                    _logger.LogError($"[UserController/updateuser05] User update failed ");
                    return BadRequest(new { message = $"update failed" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"[UserController/updateuser06] Unexpected error: {ex.Message}");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }
    }
}