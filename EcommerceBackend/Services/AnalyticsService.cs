using Microsoft.EntityFrameworkCore;
using Models;

namespace Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly AppDbContext _context;

        public AnalyticsService(AppDbContext context)
        {
            _context = context;
        }

        public async Task TrackViewAsync(int productId)
        {
            await IncrementAsync(productId, "Views", 1);
        }

        public async Task<IEnumerable<AnalyticsSummaryDto>> GetSummaryAsync()
        {
            return await _context.ProductAnalytics
                .Include(a => a.Product)
                .Select(a => new AnalyticsSummaryDto
                {
                    ProductId = a.ProductId,
                    ProductName = a.Product.Name,
                    Views = a.Views,
                    AddToCartCount = a.AddToCartCount,
                    PurchaseCount = a.PurchaseCount
                })
                .AsNoTracking()
                .ToListAsync();
        }

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
    }
}

