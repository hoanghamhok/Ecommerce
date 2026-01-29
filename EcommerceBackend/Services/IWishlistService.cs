using Models;

namespace Services
{
    public interface IWishlistService
    {
        Task<IEnumerable<Wishlist>> GetWishlistByUserAsync(int userId);
        Task<Wishlist> AddToWishlistAsync(int userId, int productId);
        Task<bool> RemoveFromWishlistAsync(int userId, int productId);
    }
}

