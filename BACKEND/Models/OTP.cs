using System.ComponentModel.DataAnnotations;

namespace SignatureAPP.Models
{
    public class OTP
    {
        [Key]
        public string OTPid { get; set; } = Guid.NewGuid().ToString("N");
        public string userId { get; set; }
        public int OTPcode { get; set; }
        public DateTime CreateTime { get; set; } = DateTime.UtcNow.AddHours(1);
        public DateTime ExpiredTime { get; set; } = DateTime.UtcNow.AddHours(1).AddMinutes(5);
        public bool userSeen { get; set; }

    }
}
