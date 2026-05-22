using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Models;

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
            EnsureValidQuantity(quantity);

            var product = await _context.Products.FindAsync(productId)
                ?? throw new ArgumentException("Khong tim thay san pham.");

            var existingCart = await _context.Carts.FirstOrDefaultAsync(
                c => c.UserId == userId && c.ProductId == productId);

            var newQuantity = quantity + (existingCart?.Quantity ?? 0);
            EnsureEnoughStock(product, newQuantity);

            if (existingCart != null)
            {
                existingCart.Quantity = newQuantity;
            }
            else
            {
                _context.Carts.Add(new Cart
                {
                    UserId = userId,
                    ProductId = productId,
                    Quantity = quantity,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<CartItemDto>> GetCartAsync(int userId)
        {
            var items = await _context.Carts
                .Where(c => c.UserId == userId)
                .Include(c => c.Product)
                .AsNoTracking()
                .ToListAsync();

            return items.Select(ToDto);
        }

        public async Task UpdateQuantityAsync(int userId, int productId, int quantity)
        {
            EnsureValidQuantity(quantity);

            var cartItem = await _context.Carts
                .Include(c => c.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == productId)
                ?? throw new ArgumentException("Khong tim thay san pham trong gio hang.");

            EnsureEnoughStock(cartItem.Product!, quantity);
            cartItem.Quantity = quantity;
            await _context.SaveChangesAsync();
        }

        public async Task RemoveFromCartAsync(int userId, int productId)
        {
            var cartItem = await _context.Carts.FirstOrDefaultAsync(
                c => c.UserId == userId && c.ProductId == productId);

            if (cartItem == null)
                throw new ArgumentException("Khong tim thay san pham trong gio hang.");

            _context.Carts.Remove(cartItem);
            await _context.SaveChangesAsync();
        }

        public async Task<CheckoutResult> CheckoutAsync(int userId)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            var cartItems = await GetCartItemsForCheckoutAsync(userId);
            var totalAmount = cartItems.Sum(item => item.Quantity * item.Product!.Price);

            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                TotalAmount = totalAmount,
                Status = "Completed"
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            AddOrderDetailsAndDecreaseStock(order, cartItems);
            _context.Carts.RemoveRange(cartItems);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            await SendCodConfirmationEmailAsync(userId, order);

            return new CheckoutResult
            {
                OrderId = order.OrderId,
                Message = "Thanh toan thanh cong"
            };
        }

        public async Task<string> CheckoutWithMomoAsync(int userId, HttpContext httpContext)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            var cartItems = await GetCartItemsForCheckoutAsync(userId);
            var totalAmount = cartItems.Sum(i => i.Product!.Price * i.Quantity);

            var order = new Order
            {
                UserId = userId,
                TotalAmount = totalAmount,
                Status = "Pending",
                OrderDate = DateTime.UtcNow
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return await _momoPaymentService.CreatePaymentUrl(order, httpContext);
        }

        public async Task ProcessMomoReturnAsync(string orderId, string resultCode)
        {
            if (resultCode != "0")
                return;

            if (!int.TryParse(orderId, out var parsedOrderId))
                throw new ArgumentException("OrderId khong hop le.");

            await using var transaction = await _context.Database.BeginTransactionAsync();

            var order = await _context.Orders.FindAsync(parsedOrderId);
            if (order == null || order.Status == "Completed")
                return;

            var cartItems = await GetCartItemsForCheckoutAsync(order.UserId);
            AddOrderDetailsAndDecreaseStock(order, cartItems);
            _context.Carts.RemoveRange(cartItems);
            order.Status = "Completed";

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            await SendMomoConfirmationEmailAsync(order.UserId, order, cartItems);
        }

        public async Task ProcessMomoNotifyAsync(int orderId, int resultCode)
        {
            if (resultCode != 0)
                return;

            var order = await _context.Orders.FindAsync(orderId);
            if (order == null || order.Status == "Completed")
                return;

            order.Status = "Paid";
            await _context.SaveChangesAsync();
        }

        private async Task<List<Cart>> GetCartItemsForCheckoutAsync(int userId)
        {
            var cartItems = await _context.Carts
                .Where(c => c.UserId == userId)
                .Include(c => c.Product)
                .ToListAsync();

            if (!cartItems.Any())
                throw new InvalidOperationException("Gio hang trong, khong the thanh toan.");

            foreach (var item in cartItems)
            {
                EnsureValidQuantity(item.Quantity);
                EnsureEnoughStock(item.Product!, item.Quantity);
            }

            return cartItems;
        }

        private void AddOrderDetailsAndDecreaseStock(Order order, IEnumerable<Cart> cartItems)
        {
            foreach (var item in cartItems)
            {
                _context.OrderDetails.Add(new OrderDetail
                {
                    OrderId = order.OrderId,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.Product!.Price
                });

                item.Product.Instock -= item.Quantity;
            }
        }

        private static void EnsureValidQuantity(int quantity)
        {
            if (quantity <= 0)
                throw new ArgumentException("So luong phai lon hon 0.");
        }

        private static void EnsureEnoughStock(Product product, int requestedQuantity)
        {
            if (product.Instock < requestedQuantity)
                throw new InvalidOperationException($"San pham '{product.Name}' chi con {product.Instock} san pham.");
        }

        private async Task SendCodConfirmationEmailAsync(int userId, Order order)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || string.IsNullOrWhiteSpace(user.Email))
                return;

            var html = $@"<h3>Don hang #{order.OrderId} da duoc xac nhan (COD)</h3>
                          <p>Tong tien: {order.TotalAmount:N0}d</p>";
            await _emailService.SendEmailAsync(user.Email, "Xac nhan don hang", html);
        }

        private async Task SendMomoConfirmationEmailAsync(int userId, Order order, IEnumerable<Cart> cartItems)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || string.IsNullOrWhiteSpace(user.Email))
                return;

            var list = string.Join("", cartItems.Select(i =>
                $"<li>{i.Product!.Name} x {i.Quantity} - {i.Product.Price:N0}d</li>"));

            var html = $@"<h3>Don hang #{order.OrderId} da thanh toan thanh cong</h3>
                          <ul>{list}</ul>
                          <p><b>Tong cong:</b> {order.TotalAmount:N0}d</p>";

            await _emailService.SendEmailAsync(user.Email, "Xac nhan don hang", html);
        }

        private static CartItemDto ToDto(Cart item)
        {
            var product = item.Product!;
            return new CartItemDto
            {
                CartItemId = item.CartItemId,
                UserId = item.UserId,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                CreatedAt = item.CreatedAt,
                Product = new CartProductDto
                {
                    Id = product.Id,
                    Name = product.Name,
                    Description = product.Description,
                    Price = product.Price,
                    Instock = product.Instock,
                    ImageUrl = product.ImageUrls.FirstOrDefault(),
                    ImageUrls = product.ImageUrls,
                    Discount = product.Discount,
                    CategoryId = product.CategoryId
                }
            };
        }
    }
}
