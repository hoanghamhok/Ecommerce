using Microsoft.EntityFrameworkCore;
using Models;
using Microsoft.AspNetCore.Http;

namespace Services
{
    public class CartService : ICartService
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;
        private readonly MomoPaymentService _momoPaymentService;

        public CartService(AppDbContext context, EmailService emailService, MomoPaymentService momoPaymentService)
        {
            _context = context;
            _emailService = emailService;
            _momoPaymentService = momoPaymentService;
        }

        public async Task AddToCartAsync(int userId, int productId, int quantity)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
                throw new ArgumentException("Không tìm thấy sản phẩm.");

            var existingCart = await _context.Carts.FirstOrDefaultAsync(
                c => c.UserId == userId && c.ProductId == productId);

            if (existingCart != null)
            {
                existingCart.Quantity += quantity;
                _context.Carts.Update(existingCart);
            }
            else
            {
                var cart = new Cart
                {
                    UserId = userId,
                    ProductId = productId,
                    Quantity = quantity,
                    CreatedAt = DateTime.Now
                };
                _context.Carts.Add(cart);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Cart>> GetCartAsync(int userId)
        {
            return await _context.Carts
                .Where(c => c.UserId == userId)
                .Include(c => c.Product)
                .ToListAsync();
        }

        public async Task UpdateQuantityAsync(int userId, int productId, int quantity)
        {
            var cartItem = await _context.Carts.FirstOrDefaultAsync(
                c => c.UserId == userId && c.ProductId == productId);

            if (cartItem == null)
                throw new ArgumentException("Không tìm thấy sản phẩm trong giỏ hàng.");

            cartItem.Quantity = quantity;
            _context.Carts.Update(cartItem);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveFromCartAsync(int userId, int productId)
        {
            var cartItem = await _context.Carts.FirstOrDefaultAsync(
                c => c.UserId == userId && c.ProductId == productId);

            if (cartItem == null)
                throw new ArgumentException("Không tìm thấy sản phẩm trong giỏ hàng.");

            _context.Carts.Remove(cartItem);
            await _context.SaveChangesAsync();
        }

        public async Task<CheckoutResult> CheckoutAsync(int userId)
        {
            var cartItems = await _context.Carts
                .Where(c => c.UserId == userId)
                .Include(c => c.Product)
                .ToListAsync();

            if (!cartItems.Any())
                throw new InvalidOperationException("Giỏ hàng trống, không thể thanh toán.");

            decimal totalAmount = cartItems.Sum(item => item.Quantity * item.Product.Price);

            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.Now,
                TotalAmount = totalAmount,
                Status = "Completed"
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

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

            _context.Carts.RemoveRange(cartItems);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(userId);
            if (user != null && !string.IsNullOrEmpty(user.Email))
            {
                string html = $@"<h3>Đơn hàng #{order.OrderId} đã được xác nhận (COD)</h3>
                                <p>Tổng tiền: {order.TotalAmount:N0}đ</p>";
                await _emailService.SendEmailAsync(user.Email, "Xác nhận đơn hàng", html);
            }

            return new CheckoutResult
            {
                OrderId = order.OrderId,
                Message = "Thanh toán thành công"
            };
        }

        public async Task<string> CheckoutWithMomoAsync(int userId, HttpContext httpContext)
        {
            var cartItems = await _context.Carts
                .Where(c => c.UserId == userId)
                .Include(c => c.Product)
                .ToListAsync();

            if (!cartItems.Any())
                throw new InvalidOperationException("Giỏ hàng trống.");

            decimal totalAmount = cartItems.Sum(i => i.Product.Price * i.Quantity);

            var order = new Order
            {
                UserId = userId,
                TotalAmount = totalAmount,
                Status = "Pending",
                OrderDate = DateTime.Now
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            string momoUrl = await _momoPaymentService.CreatePaymentUrl(order, httpContext);
            return momoUrl;
        }

        public async Task ProcessMomoReturnAsync(string orderId, string resultCode)
        {
            if (resultCode != "0")
                return;

            var order = await _context.Orders.FindAsync(int.Parse(orderId));
            if (order == null || order.Status == "Completed")
                return;

            var cartItems = await _context.Carts
                .Where(c => c.UserId == order.UserId)
                .Include(c => c.Product)
                .ToListAsync();

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

            var user = await _context.Users.FindAsync(order.UserId);
            if (!string.IsNullOrEmpty(user?.Email))
            {
                var list = string.Join("", cartItems.Select(i =>
                    $"<li>{i.Product.Name} x {i.Quantity} - {i.Product.Price:N0}đ</li>"));

                string html = $@"
                    <h3>Đơn hàng #{order.OrderId} đã thanh toán thành công</h3>
                    <ul>{list}</ul>
                    <p><b>Tổng cộng:</b> {order.TotalAmount:N0}đ</p>";

                await _emailService.SendEmailAsync(user.Email, "Xác nhận đơn hàng", html);
            }
        }

        public async Task ProcessMomoNotifyAsync(int orderId, int resultCode)
        {
            if (resultCode == 0)
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order != null)
                {
                    order.Status = "Paid";
                    await _context.SaveChangesAsync();
                }
            }
        }
    }
}

