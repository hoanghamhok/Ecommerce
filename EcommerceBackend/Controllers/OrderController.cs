using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;
using System.Security.Claims;

namespace Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        private int? GetUserIdFromToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        [HttpGet("admin")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _orderService.GetAllOrdersAsync();
            return Ok(orders);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetOrders()
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized(new { message = "User not found in token." });

            var orders = await _orderService.GetUserOrdersAsync(userId.Value);
            return Ok(orders);
        }

        [HttpGet("{orderId}")]
        [Authorize]
        public async Task<IActionResult> GetOrderDetail(int orderId)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized(new { message = "User not found in token." });

            var orderDetail = await _orderService.GetOrderDetailAsync(orderId, userId.Value);
            if (orderDetail == null)
                return NotFound(new { message = "Order not found." });

            return Ok(orderDetail);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var deleted = await _orderService.DeleteOrderAsync(id);
            if (!deleted)
                return NotFound(new { message = "Order not found." });

            return Ok(new { message = "Order deleted successfully." });
        }
    }
}
