using SignatureAPP.Models;

namespace SignatureAPP.Services
{
    public interface IOtpService
    {
        public  Task generateOTP(string userid);
        public  Task<OTP> getOtp(int code, string userid);

        //public  Task generatePassOTP(string email);

    }
}
