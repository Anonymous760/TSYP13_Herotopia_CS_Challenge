using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SignatureAPP.Models;

namespace SignatureAPP.Data
{
    public class DbContextClass : IdentityDbContext<AppUser>
    {
        public DbContextClass(DbContextOptions<DbContextClass> options) : base(options) { }
       
       
        public DbSet<NeoDocument> NeoDocuments { get; set; }
      
       
        public DbSet <OTP> Otps { get; set; }
      
        
    }
}
