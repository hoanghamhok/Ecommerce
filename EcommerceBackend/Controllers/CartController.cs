using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Services;
using DTOs;

namespace Controllers
{
    [Route("api/Cart")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        private int? GetUserIdFromToken()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : (int?)null;
        }

        //Thêm sản phẩm vào giỏ hàng
        [HttpPost("add")]
        [Authorize]
        public async Task<IActionResult> AddToCart([FromBody] CartRequest request)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("Không tìm thấy người dùng.");

            try
            {
                await _cartService.AddToCartAsync(userId.Value, request.ProductId, request.Quantity);
                return Ok(new { message = "Thêm hàng vào giỏ hàng thành công." });
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
        }

        //Lấy giỏ hàng của khách hàng
        [HttpGet("get")]
        [Authorize]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("Không tìm thấy người dùng.");

            var cartItems = await _cartService.GetCartAsync(userId.Value);
            if (!cartItems.Any())
                return NotFound("Giỏ hàng trống.");

            return Ok(cartItems);
        }

        //Thay đổi số lượng sản phẩm trong giỏ hàng
        [HttpPut("update-quantity")]
        [Authorize]
        public async Task<IActionResult> UpdateQuantity([FromBody] CartRequest request)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("Không tìm thấy người dùng.");

            try
            {
                await _cartService.UpdateQuantityAsync(userId.Value, request.ProductId, request.Quantity);
                return Ok(new { message = "Cập nhật số lượng thành công." });
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
        }

        //Xóa sản phẩm khỏi giỏ hàng
        [HttpDelete("remove/{productId}")]
        [Authorize]
        public async Task<IActionResult> RemoveFromCart(int productId)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("Không tìm thấy người dùng.");

            try
            {
                await _cartService.RemoveFromCartAsync(userId.Value, productId);
                return Ok(new { message = "Xóa sản phẩm khỏi giỏ hàng thành công." });
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
        }

        //Thanh toán COD
        [HttpPost("checkout")]
        [Authorize]
        public async Task<IActionResult> Checkout()
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("Không tìm thấy người dùng.");

            try
            {
                var result = await _cartService.CheckoutAsync(userId.Value);
                return Ok(new { message = result.Message, orderId = result.OrderId });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        //Thanh toán bằng MoMo
        [HttpPost("checkout-momo")]
        [Authorize]
        public async Task<IActionResult> PayWithMomo()
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized();

            try
            {
                string momoUrl = await _cartService.CheckoutWithMomoAsync(userId.Value, HttpContext);
                return Ok(new { url = momoUrl });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("momo-return")]
        public async Task<IActionResult> MomoReturn(
            [FromQuery] string orderId,
            [FromQuery] string resultCode)
        {
            if (resultCode != "0")
                return Redirect("http://localhost:3000/payment-fail");

            await _cartService.ProcessMomoReturnAsync(orderId, resultCode);
            return Redirect($"http://localhost:3000/payment-success?orderId={orderId}");
        }

        [HttpPost("momo-notify")]
        public async Task<IActionResult> MomoNotify([FromBody] MomoNotifyModel notify)
        {
            await _cartService.ProcessMomoNotifyAsync(int.Parse(notify.OrderId),notify.ResultCode);
            return Ok(); // MoMo yêu cầu luôn trả 200 OK
        }
    }
}
