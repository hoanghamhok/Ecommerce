using Microsoft.EntityFrameworkCore;
using Models;

namespace Services
{
    public class WishlistService : IWishlistService
    {
        private readonly AppDbContext _context;

        public WishlistService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Wishlist>> GetWishlistByUserAsync(int userId)
        {
            return await _context.Wishlists
                .Include(w => w.Product)
                .Where(w => w.UserId == userId)
                .ToListAsync();
        }

        public async Task<Wishlist> AddToWishlistAsync(int userId, int productId)
        {
            var exists = await _context.Wishlists
                .AnyAsync(w => w.UserId == userId && w.ProductId == productId);

            if (exists)
                throw new InvalidOperationException("Sản phẩm đã có trong wishlist.");

            var wishlist = new Wishlist
            {
                UserId = userId,
                ProductId = productId
            };

            _context.Wishlists.Add(wishlist);
            await _context.SaveChangesAsync();
            return wishlist;
        }

        public async Task<bool> RemoveFromWishlistAsync(int userId, int productId)
        {
            var item = await _context.Wishlists
                .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);

            if (item == null)
                return false;

            _context.Wishlists.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

