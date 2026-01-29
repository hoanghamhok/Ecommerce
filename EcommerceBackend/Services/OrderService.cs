using Microsoft.EntityFrameworkCore;
using Models;

namespace Services
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;

        public OrderService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
        {
            return await _context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .Select(o => new OrderDto
                {
                    OrderId = o.OrderId,
                    CreatedAt = o.OrderDate,
                    OrderDetails = o.OrderDetails.Select(od => new OrderDetailDto
                    {
                        ProductId = od.ProductId,
                        Quantity = od.Quantity,
                        Price = od.UnitPrice,
                        ProductName = od.Product.Name
                    }).ToList()
                }).ToListAsync();
        }

        public async Task<IEnumerable<Order>> GetUserOrdersAsync(int userId)
        {
            return await _context.Orders
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<OrderDetailResponse?> GetOrderDetailAsync(int orderId, int userId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == userId);

            if (order == null)
                return null;

            var details = await _context.OrderDetails
                .Where(d => d.OrderId == orderId)
                .Include(d => d.Product)
                .ToListAsync();

            return new OrderDetailResponse
            {
                OrderId = order.OrderId,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                CustomerName = order.User.FullName,
                CustomerEmail = order.User.Email,
                PhoneNumber = order.User.Phone,
                Items = details.Select(d => new OrderItemDto
                {
                    ProductId = d.ProductId,
                    ProductName = d.Product.Name,
                    Quantity = d.Quantity,
                    UnitPrice = d.UnitPrice,
                    Total = d.Quantity * d.UnitPrice
                }).ToList()
            };
        }

        public async Task<bool> DeleteOrderAsync(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                return false;

            _context.OrderDetails.RemoveRange(order.OrderDetails);
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}

