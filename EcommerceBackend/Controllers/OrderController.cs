using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;

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

        // Lấy userId từ token
        private int? GetUserIdFromToken()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : (int?)null;
        }

        [HttpGet("admin")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _orderService.GetAllOrdersAsync();
            return Ok(orders);
        }

        /// <summary>
        /// Lấy danh sách các đơn hàng của người dùng
        /// </summary>
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetOrders()
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("Không tìm thấy người dùng.");

            var orders = await _orderService.GetUserOrdersAsync(userId.Value);
            return Ok(orders);
        }

        /// <summary>
        /// Lấy chi tiết đơn hàng theo orderId
        /// </summary>
        [HttpGet("{orderId}")]
        [Authorize]
        public async Task<IActionResult> GetOrderDetail(int orderId)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("Không tìm thấy người dùng.");

            var orderDetail = await _orderService.GetOrderDetailAsync(orderId, userId.Value);
            if (orderDetail == null)
                return NotFound("Không tìm thấy đơn hàng.");

            return Ok(orderDetail);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var deleted = await _orderService.DeleteOrderAsync(id);
            if (!deleted)
                return NotFound(new { message = "Không tìm thấy đơn hàng." });

            return Ok(new { message = "Đã xoá đơn hàng thành công." });
        }
    }
}
