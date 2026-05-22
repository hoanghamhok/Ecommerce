using DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;
using System.Security.Claims;

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
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        [HttpPost("add")]
        [Authorize]
        public async Task<IActionResult> AddToCart([FromBody] CartRequest request)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized(new { message = "User not found in token." });

            await _cartService.AddToCartAsync(userId.Value, request.ProductId, request.Quantity);
            return Ok(new { message = "Added to cart successfully." });
        }

        [HttpGet("get")]
        [Authorize]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized(new { message = "User not found in token." });

            var cartItems = await _cartService.GetCartAsync(userId.Value);
            return Ok(cartItems);
        }

        [HttpPut("update-quantity")]
        [Authorize]
        public async Task<IActionResult> UpdateQuantity([FromBody] CartRequest request)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized(new { message = "User not found in token." });

            await _cartService.UpdateQuantityAsync(userId.Value, request.ProductId, request.Quantity);
            return Ok(new { message = "Quantity updated successfully." });
        }

        [HttpDelete("remove/{productId}")]
        [Authorize]
        public async Task<IActionResult> RemoveFromCart(int productId)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized(new { message = "User not found in token." });

            await _cartService.RemoveFromCartAsync(userId.Value, productId);
            return Ok(new { message = "Removed from cart successfully." });
        }

        [HttpPost("checkout")]
        [Authorize]
        public async Task<IActionResult> Checkout()
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized(new { message = "User not found in token." });

            var result = await _cartService.CheckoutAsync(userId.Value);
            return Ok(new { message = result.Message, orderId = result.OrderId });
        }

        [HttpPost("checkout-momo")]
        [Authorize]
        public async Task<IActionResult> PayWithMomo()
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized(new { message = "User not found in token." });

            var momoUrl = await _cartService.CheckoutWithMomoAsync(userId.Value, HttpContext);
            return Ok(new { url = momoUrl });
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
            if (!int.TryParse(notify.OrderId, out var orderId))
                return BadRequest(new { message = "OrderId is invalid." });

            await _cartService.ProcessMomoNotifyAsync(orderId, notify.ResultCode);
            return Ok();
        }
    }
}
