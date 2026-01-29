namespace Services
{
    public interface IAnalyticsService
    {
        Task TrackViewAsync(int productId);
        Task<IEnumerable<AnalyticsSummaryDto>> GetSummaryAsync();
    }

    public class AnalyticsSummaryDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Views { get; set; }
        public int AddToCartCount { get; set; }
        public int PurchaseCount { get; set; }
    }
}

