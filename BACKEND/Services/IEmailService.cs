using SignatureAPP.Models;
using System.Threading.Tasks;

namespace SignatureAPP.Services
{
    public interface IEmailService
    {
        Task SendVerificationEmail(string email, string fullName, string token);
        public  Task SendSignatureEmail(string nextSigner, string creatorName, string signerName, string transId, string signerEmail);
        public  Task sendSignedpdfEmail(string recipientEmail, string fullName, List<NeoDocument> docs);
        public  Task sendOTP(string email,  int code);
    }
}
