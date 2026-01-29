using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Services;

namespace YourNamespace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;

        public WishlistController(IWishlistService wishlistService)
        {
            _wishlistService = wishlistService;
        }

        private int? GetUserIdFromToken()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : (int?)null;
        }

        // GET: api/wishlist/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Models.Wishlist>>> GetWishlistByUser(int userId)
        {
            var wishlist = await _wishlistService.GetWishlistByUserAsync(userId);
            return Ok(wishlist);
        }

        // POST: api/wishlist
        [HttpPost]
        public async Task<ActionResult> AddToWishlist([FromBody] WishlistDto dto)
        {
            try
            {
                var wishlist = await _wishlistService.AddToWishlistAsync(dto.UserId, dto.ProductId);
                return Ok(wishlist);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/wishlist?userId=1&productId=2
        [HttpDelete]
        public async Task<ActionResult> RemoveFromWishlist(int userId, int productId)
        {
            var deleted = await _wishlistService.RemoveFromWishlistAsync(userId, productId);
            if (!deleted)
                return NotFound("Không tìm thấy sản phẩm trong wishlist.");

            return Ok("Đã xoá khỏi wishlist.");
        }

        public class WishlistDto
        {
            public int UserId { get; set; }
            public int ProductId { get; set; }
        }
    }
}
