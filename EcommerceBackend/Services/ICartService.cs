using Models;

using Microsoft.AspNetCore.Http;

namespace Services
{
    public interface ICartService
    {
        Task AddToCartAsync(int userId, int productId, int quantity);
        Task<IEnumerable<Cart>> GetCartAsync(int userId);
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
}

