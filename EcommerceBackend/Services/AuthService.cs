using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Models;

namespace Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<AuthResult> LoginAsync(string username, string password)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username && u.IsActive);

            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.Password))
                throw new UnauthorizedAccessException("Sai ten dang nhap hoac mat khau.");

            return new AuthResult
            {
                Token = GenerateJwtToken(user),
                User = UserDto.FromUser(user)
            };
        }

        public async Task<AuthResult> GenerateJwtTokenFromGoogleAsync(string email, string name)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Google account email is required.");

            var normalizedEmail = email.Trim().ToLowerInvariant();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

            if (user == null)
            {
                user = new User
                {
                    Username = normalizedEmail,
                    Email = normalizedEmail,
                    FullName = string.IsNullOrWhiteSpace(name) ? normalizedEmail : name,
                    Password = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString("N")),
                    Phone = string.Empty,
                    Role = "nhanvien",
                    IsActive = true
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            return new AuthResult
            {
                Token = GenerateJwtToken(user),
                User = UserDto.FromUser(user)
            };
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT key is not configured.");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var expiryInMinutes = Convert.ToDouble(_config["Jwt:ExpiryInMinutes"] ?? "120");

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryInMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
