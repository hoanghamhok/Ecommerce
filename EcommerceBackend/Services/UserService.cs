using Microsoft.EntityFrameworkCore;
using Models;

namespace Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserDto> CreateUserAsync(CreateUserRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                throw new ArgumentException("Username already exists.");

            var user = new User
            {
                Username = request.Username,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FullName = request.FullName,
                Role = "nhanvien",
                Phone = request.Phone,
                Email = request.Email,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return UserDto.FromUser(user);
        }

        public async Task<IEnumerable<UserDto>> GetUsersAsync()
        {
            var users = await _context.Users.AsNoTracking().ToListAsync();
            return users.Select(UserDto.FromUser);
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
            return user == null ? null : UserDto.FromUser(user);
        }

        public async Task<UserDto> RegisterAsync(CreateUserRequest request)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Username == request.Username || u.Email == request.Email);
            if (userExists)
                throw new ArgumentException("Username or email already exists.");

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FullName = request.FullName,
                Phone = request.Phone,
                Role = "nhanvien",
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return UserDto.FromUser(user);
        }
    }
}
