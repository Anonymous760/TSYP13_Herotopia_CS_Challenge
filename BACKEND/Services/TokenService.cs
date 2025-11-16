
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace SignatureAPP.Services
{
    public class TokenService:ITokenService
    {
        private readonly  IConfiguration _configuration;
        public TokenService (IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public string GenerateTokenAcces(IEnumerable<Claim> claims)
        {

            try
            {
                var secretKey = _configuration["Jwt:Key"];
                if (string.IsNullOrEmpty(secretKey))
                {
                    throw new ArgumentNullException("Jwt:Key", "The JWT signing key is missing in the configuration.");
                }


                var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
                var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);


                var expirationMinutes = _configuration["Jwt:AccessTokenExpirationMinutes"];
                var expires = DateTime.UtcNow.AddHours(1).AddMinutes(expirationMinutes == null || !double.TryParse(expirationMinutes, out var minutes) ? 200 : minutes);


                var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    audience: _configuration["Jwt:Audience"],
                    claims: claims,
                    expires: expires,
                    signingCredentials: credentials
                );


                return new JwtSecurityTokenHandler().WriteToken(token);
            }
            catch (Exception ex) { Console.WriteLine(ex.Message); return null; }
        }



    }
}
