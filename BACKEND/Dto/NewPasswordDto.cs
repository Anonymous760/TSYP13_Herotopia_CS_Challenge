using System.ComponentModel.DataAnnotations;

namespace SignatureAPP.Dto
{
    public class NewPasswordDto
    {
        [Required]
       public  string email { get; set; }
        [Required]
        public string newpass { get; set; }
    }
}
