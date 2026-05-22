using Microsoft.AspNetCore.Http;

namespace Services
{
    public interface ICartService
    {
        Task AddToCartAsync(int userId, int productId, int quantity);
        Task<IEnumerable<CartItemDto>> GetCartAsync(int userId);
        Task UpdateQuantityAsync(int userId, int productId, int quantity);
        Task RemoveFromCartAsync(int userId, int productId);
        Task<CheckoutResult> CheckoutAsync(int userId);
        Task<string> CheckoutWithMomoAsync(int userId, HttpContext httpContext);
        Task ProcessMomoReturnAsync(string orderId, string resultCode);
        Task ProcessMomoNotifyAsync(int orderId, int resultCode);
    }

    public class CheckoutResult
    {
        public int OrderId { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class CartRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class CartItemDto
    {
        public int CartItemId { get; set; }
        public int UserId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public DateTime CreatedAt { get; set; }
        public CartProductDto Product { get; set; } = null!;
    }

    public class CartProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int Instock { get; set; }
        public string? ImageUrl { get; set; }
        public List<string> ImageUrls { get; set; } = new();
        public int? Discount { get; set; }
        public int CategoryId { get; set; }
    }
}
