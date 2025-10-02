using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Models;

namespace Controllers
{
    [Route("api/Cart")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;
        private readonly MomoPaymentService _momoPaymentService;
        public CartController(AppDbContext context)
        {
            _context = context;
        }

        //Thêm sản phẩm vào giỏ hàng
        [HttpPost("add")]
        // [Authorize]
        public async Task<IActionResult> AddToCart([FromBody] CartRequest request)
        {

            var userId = GetUserIdFromToken();
            Console.WriteLine("User Id: " + userId);
            if (userId == null)
                return Unauthorized("Không tìm thấy người dùng.");

            //Lấy sản phẩm
            var product = await _context.Products.FindAsync(request.ProductId);
            if (product == null)
                return NotFound("Không tìm thấy sản phẩm.");

            //Kiểm tra xem sản phẩm có tồn tại trong giỏ hàng chưa
            var existingCart = await _context.Carts.FirstOrDefaultAsync(
                c => c.UserId == userId && c.ProductId == request.ProductId);
            if (existingCart != null)
            {
                existingCart.Quantity += request.Quantity;
                _context.Carts.Update(existingCart);
            }
            else
            {
                var cart = new Cart
                {
                    UserId = (int)userId,
                    ProductId = request.ProductId,
                    Quantity = request.Quantity,
                    CreatedAt = DateTime.Now
                };
                _context.Carts.Add(cart);
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = "Thêm hàng vào giỏ hàng thành công." });

        }

        private int? GetUserIdFromToken()
        {
            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"Claim Type: {claim.Type}, Value: {claim.Value}");
            }
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");  // Lấy giá trị từ claim 'sub'
            Console.WriteLine("UserIdClaim: " + User.ToString());
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : (int?)null;
        }

        //Lấy giỏ hàng của khách hàng
        [HttpGet("get")]
        [Authorize]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("Không tìm thấy người dùng.");
            var cartItems = await _context.Carts
                .Where(c => c.UserId == userId)
                .Include(c => c.Product)
                .ToListAsync();

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

            Console.WriteLine("ProductId: " + request.ProductId);
            Console.WriteLine(request.Quantity);

            var cartItem = await _context.Carts.FirstOrDefaultAsync(
                c => c.UserId == userId && c.ProductId == request.ProductId);
            if (cartItem == null)
                return NotFound("Không tìm thấy sản phẩm trong giỏ hàng.");

            cartItem.Quantity = request.Quantity;
            _context.Carts.Update(cartItem);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật số lượng thành công." });
        }
        //Xóa sản phẩm khỏi giỏ hàng
        [HttpDelete("remove/{productId}")]
        [Authorize]
        public async Task<IActionResult> RemoveFromCart(int productId)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("Không tìm thấy người dùng.");

            var cartItem = await _context.Carts.FirstOrDefaultAsync(
                c => c.UserId == userId && c.ProductId == productId);
            if (cartItem == null)
                return NotFound("Không tìm thấy sản phẩm trong giỏ hàng.");

            _context.Carts.Remove(cartItem);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa sản phẩm khỏi giỏ hàng thành công." });
        }
        //Thanh toán COD
        [HttpPost("checkout")]
        [Authorize]
        public async Task<IActionResult> Checkout()
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("Không tìm thấy người dùng.");

            var cartItems = await _context.Carts
                .Where(c => c.UserId == userId)
                .Include(c => c.Product)
                .ToListAsync();

            if (!cartItems.Any())
                return BadRequest("Giỏ hàng trống, không thể thanh toán.");

            // Tính tổng tiền
            decimal totalAmount = cartItems.Sum(item => item.Quantity * item.Product.Price);

            // Tạo đơn hàng (Order)
            var order = new Order
            {
                UserId = userId.Value,
                OrderDate = DateTime.Now,
                TotalAmount = totalAmount
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Tạo chi tiết đơn hàng
            foreach (var item in cartItems)
            {
                var detail = new OrderDetail
                {
                    OrderId = order.OrderId,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.Product.Price
                };
                _context.OrderDetails.Add(detail);
            }

            // Xóa giỏ hàng
            _context.Carts.RemoveRange(cartItems);
            await _context.SaveChangesAsync();
            order.Status = "Completed"; // Cập nhật trạng thái đơn hàng
            var user = await _context.Users.FindAsync(userId.Value);
            if (user != null && !string.IsNullOrEmpty(user.Email))
            {
                string html = $@"<h3>Đơn hàng #{order.OrderId} đã được xác nhận (COD)</h3>
                                <p>Tổng tiền: {order.TotalAmount:N0}đ</p>";
                await _emailService.SendEmailAsync(user.Email, "Xác nhận đơn hàng", html);
            }
            return Ok(new { message = "Thanh toán thành công", orderId = order.OrderId });
        }
        //Thanh toán bằng MoMo
        [HttpPost("checkout-momo")]
        [Authorize]
        public async Task<IActionResult> PayWithMomo([FromServices] MomoPaymentService momoService)
        {
            var userId = GetUserIdFromToken();
            if (userId == null) return Unauthorized();

            // Lấy giỏ hàng
            var cartItems = await _context.Carts
                .Where(c => c.UserId == userId)
                .Include(c => c.Product)
                .ToListAsync();

            if (!cartItems.Any()) return BadRequest("Giỏ hàng trống.");

            decimal totalAmount = cartItems.Sum(i => i.Product.Price * i.Quantity);

            // Tạo đơn hàng chưa thanh toán
            var order = new Order
            {
                UserId = userId.Value,
                TotalAmount = totalAmount,
                Status = "Pending",
                OrderDate = DateTime.Now
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Trả về link thanh toán
            string momoUrl = await momoService.CreatePaymentUrl(order, HttpContext);
            return Ok(new { url = momoUrl });
        }

        [HttpGet("momo-return")]
        public async Task<IActionResult> MomoReturn(
            [FromQuery] string orderId,
            [FromQuery] string resultCode,
            [FromServices] EmailService emailService)
        {
            if (resultCode != "0")
                return Redirect("http://localhost:3000/payment-fail");

            var order = await _context.Orders.FindAsync(int.Parse(orderId));
            if (order == null || order.Status == "Completed")
                return Redirect("http://localhost:3000/payment-fail");

            var user = await _context.Users.FindAsync(order.UserId);

            // Lấy chi tiết giỏ hàng để lưu lại và gửi email
            var cartItems = await _context.Carts
                .Where(c => c.UserId == order.UserId)
                .Include(c => c.Product)
                .ToListAsync();

            // Lưu chi tiết đơn hàng
            foreach (var item in cartItems)
            {
                _context.OrderDetails.Add(new OrderDetail
                {
                    OrderId = order.OrderId,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.Product.Price
                });
            }

            _context.Carts.RemoveRange(cartItems);
            order.Status = "Completed";
            await _context.SaveChangesAsync();

            if (!string.IsNullOrEmpty(user?.Email))
            {
                var list = string.Join("", cartItems.Select(i =>
                    $"<li>{i.Product.Name} x {i.Quantity} - {i.Product.Price:N0}đ</li>"));

                string html = $@"
                    <h3>Đơn hàng #{order.OrderId} đã thanh toán thành công</h3>
                    <ul>{list}</ul>
                    <p><b>Tổng cộng:</b> {order.TotalAmount:N0}đ</p>";

                await emailService.SendEmailAsync(user.Email, "Xác nhận đơn hàng", html);
            }

            return Redirect($"http://localhost:3000/payment-success?orderId={order.OrderId}");
        }
        [HttpPost("momo-notify")]
        public async Task<IActionResult> MomoNotify([FromBody] MomoNotifyModel notify)
        {
            if (notify.ResultCode == 0)
            {
                var order = await _context.Orders.FindAsync(notify.OrderId);
                if (order != null)
                {
                    order.Status = "Paid";
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(); // MoMo yêu cầu luôn trả 200 OK
        }
        public class CartRequest
        {
            public int ProductId { get; set; }
            public int Quantity { get; set; }
        }
    }
}