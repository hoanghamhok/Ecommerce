using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcommerceBackend.Models;

namespace Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AnalyticsController(AppDbContext context) => _context = context;

        private async Task IncrementAsync(int productId, string field, int delta = 1)
        {
            string col = field switch
            {
                "Views" => "Views",
                "AddToCartCount" => "AddToCartCount",
                "PurchaseCount" => "PurchaseCount",
                _ => throw new ArgumentOutOfRangeException(nameof(field))
            };

            string sql = $@"
            IF NOT EXISTS (SELECT 1 FROM ProductAnalytics WHERE ProductId = @p0)
            BEGIN
                INSERT INTO ProductAnalytics(ProductId, Views, AddToCartCount, PurchaseCount)
                VALUES(@p0, 0, 0, 0);
            END
            UPDATE ProductAnalytics SET {col} = {col} + @p1 WHERE ProductId = @p0;";
            await _context.Database.ExecuteSqlRawAsync(sql, productId, delta);
        }

        [HttpPost("view/{productId:int}")]
        public async Task<IActionResult> TrackView([FromRoute] int productId)
        {
            await IncrementAsync(productId, "Views", 1);
            return Ok();
        }
        [HttpGet("summary")]
        public async Task<IActionResult> Summary()
        {
            var data = await _context.ProductAnalytics
                .Include(a => a.Product)
                .Select(a => new {
                    a.ProductId,
                    ProductName = a.Product.Name,
                    a.Views,
                    a.AddToCartCount,
                    a.PurchaseCount
                })
                .AsNoTracking()
                .ToListAsync();

            return Ok(data);
        }
    }
}
