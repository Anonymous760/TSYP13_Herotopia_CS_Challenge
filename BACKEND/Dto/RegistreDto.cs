using Microsoft.AspNetCore.Identity;

namespace SignatureAPP.Dto
{
    public class RegistreDto
    {
        public string lastName {  get; set; } = String.Empty;
        public string firstName { get; set; } = String.Empty;
       
        public string NumeroTel { get; set; } = String.Empty;
        public string Password {  get; set; } = String.Empty;
        
       
    }
}
