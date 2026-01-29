using Models;

namespace Services
{
    public interface IAuthService
    {
        Task<AuthResult> LoginAsync(string username, string password);
        Task<string> GenerateJwtTokenFromGoogleAsync(string email, string name);
    }

    public class AuthResult
    {
        public string Token { get; set; } = string.Empty;
        public User User { get; set; } = null!;
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}

