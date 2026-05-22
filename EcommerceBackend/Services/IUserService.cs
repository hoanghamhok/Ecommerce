using Models;

namespace Services
{
    public interface IUserService
    {
        Task<UserDto> CreateUserAsync(CreateUserRequest request);
        Task<IEnumerable<UserDto>> GetUsersAsync();
        Task<UserDto?> GetUserByIdAsync(int id);
        Task<UserDto> RegisterAsync(CreateUserRequest request);
    }

    public class CreateUserRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}

