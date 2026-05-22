using Models;

namespace Services
{
    public interface IAuthService
    {
        Task<AuthResult> LoginAsync(string username, string password);
        Task<AuthResult> GenerateJwtTokenFromGoogleAsync(string email, string name);
    }

    public class AuthResult
    {
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; } = null!;
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Gender { get; set; }
        public int? Age { get; set; }
        public DateTime? CreatedAt { get; set; }
        public bool IsActive { get; set; }

        public static UserDto FromUser(User user) => new()
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Role = user.Role,
            Phone = user.Phone,
            Email = user.Email,
            Gender = user.Gender,
            Age = user.Age,
            CreatedAt = user.CreatAt,
            IsActive = user.IsActive
        };
    }
}
