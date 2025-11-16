using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SignatureAPP.Dto;
using SignatureAPP.Models;
using SignatureAPP.Services;

namespace SignatureAPP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly ITokenService _tokenService;
        public AdminController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, IConfiguration configuration, IEmailService emailService, ITokenService tokenService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _emailService = emailService;
            _tokenService = tokenService;
        }

        //[HttpPost("Registre")]
        //public async Task<IActionResult> Registre([FromBody] RegistreDto model)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(new { message = "Invalid request" });
        //    }

        //    var user = new AppUser
        //    {
        //        UserName = model.email,
        //        Email = model.email,
        //        nom = model.nom,
        //        Prenom = model.prenom,
        //        PhoneNumber = model.NumeroTel,
        //        sexe = model.Sexe,
        //        DateOfbirth = model.DateOfbirth,
               
        //        EmailConfirmed = false
        //    };
            

            
        //        var result = await _userManager.CreateAsync(user, model.Password);
        //        if (result.Succeeded)
        //        {
        //            await _userManager.AddToRoleAsync(user, "Admin");
        //            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        //            await _emailService.SendVerificationEmail(user.Email, $"{user.Prenom} {user.nom}", token);
        //            return Ok(new { message = "User registered. Check your email for verification." });
        //        }
        //        return BadRequest(new { message = "User not registered", errors = result.Errors });
            
           
        //}
    }
}
