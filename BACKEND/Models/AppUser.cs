using Microsoft.AspNetCore.Identity;

namespace SignatureAPP.Models
{
    public class AppUser:IdentityUser

    {
        public string? firstName { get; set; }
        public string? lastName {  get; set; }
       public string? status {  get; set; }
        
        
        public string? roles { get; set; }
        
        
    }
}
