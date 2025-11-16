using System.Security.Claims;

namespace SignatureAPP.Services
{
    public interface ITokenService
    {
       
        public string GenerateTokenAcces(IEnumerable<Claim> claims);

    }
}
