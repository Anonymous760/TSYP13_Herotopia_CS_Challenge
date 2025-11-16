using System.ComponentModel.DataAnnotations;

namespace SignatureAPP.Dto
{
    public class LoginDto
    {
        [EmailAddress]
        public string Email { get; set; } = String.Empty;
        public string Password { get; set; } = String.Empty;
    }
}
