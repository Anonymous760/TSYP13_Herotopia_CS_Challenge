using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SignatureAPP.Data;
using SignatureAPP.Dto;
using SignatureAPP.Models;
using SignatureAPP.ReturnRes;
using SignatureAPP.ReturnRes;


using SignatureAPP.Services;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SignatureAPP.Controllers
{
    [Route("protected-resource/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class TransactionController : ControllerBase
    {
        private readonly DbContextClass _dbContext;
        private readonly UserManager<AppUser> _userManager;
        private readonly ITransactionService _transactionService;

        private readonly ILogger<TransactionController> _logger;



        public TransactionController(DbContextClass dbContext, UserManager<AppUser> userManager, ITransactionService transactionService, ILogger<TransactionController> logger)
        {
            _dbContext = dbContext;
            _userManager = userManager;
            _transactionService = transactionService;

            _logger = logger;

        }

        [HttpPost("pdfs")]
        public async Task<IActionResult> AddTransaction([FromBody] List<NeoFileUpload> models)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogError($"[TransactionController/AddTransaction01] Invalid model.");
                    return BadRequest(new { message = "Invalid model" });
                }

                var userEmail = User.FindFirstValue(ClaimTypes.Email);
                if (userEmail == null)
                {
                    _logger.LogError($"[TransactionController/AddTransaction02] Email not in token.");
                    return Unauthorized(new { message = "User email not found in token" });
                }

                var user = await _userManager.FindByEmailAsync(userEmail);
                if (user == null)
                {
                    _logger.LogError($"[TransactionController/AddTransaction03] User not found in DB");
                    return NotFound(new { message = "User not found" });
                }

                var documents = await _transactionService.AddDocumentAsync(models, user.Id);
                if (documents.documents == null || !documents.documents.Any() || documents.returns == null || !documents.returns.Any())
                {
                    _logger.LogError($"[TransactionController/AddTransaction04] Documents not added .");
                    return BadRequest(new { message = "No valid documents found" });
                }


                _logger.LogInformation($"[TransactionController/AddTransaction06] Documents  created successfully");
                return Ok(new
                {

                    documents = documents.returns
                });


            }
            catch (Exception ex)
            {
                _logger.LogError($"[TransactionController/AddTransaction08] Unexpected error: {ex.Message}");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }
        [HttpGet("GetCV")]
        public async Task<IActionResult> GetDocs()
        {
            try
            {
                var userEmail = User.FindFirstValue(ClaimTypes.Email);
                if (userEmail == null)
                {
                    _logger.LogError("[TransactionController/GetDocs] Email not in token.");
                    return Unauthorized(new { message = "User email not found in token" });
                }

                var user = await _userManager.FindByEmailAsync(userEmail);
                if (user == null)
                {
                    _logger.LogError("[TransactionController/GetDocs] User not found in DB");
                    return NotFound(new { message = "User not found" });
                }

                var doc = await _dbContext.NeoDocuments
                    .FirstOrDefaultAsync(x => x.UserId == user.Id);

                if (doc == null)
                {
                    _logger.LogError("[TransactionController/GetDocs] Doc not found");
                    return NotFound(new { message = "Document not found" });
                }

                var res = await _transactionService.GetPdfInfo(doc);
                if (res == null)
                {
                    _logger.LogError("[TransactionController/GetDocs] PDF Info not found");
                    return NotFound(new { message = "PDF info not found" });
                }

                var userDto = new UserDto
                {
                    firstName = user.firstName,
                    lastName = user.lastName,
                    email = user.Email,
                    phone = user.PhoneNumber
                };


                return Ok(new
                {
                    document = res,
                    user = userDto
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[TransactionController/AddTransaction08] Unexpected error: {ex.Message}");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }
    }
}