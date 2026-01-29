using Models;

namespace Services
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetProductsAsync();
        Task<Product?> GetProductByIdAsync(int id);
        Task<Product> CreateProductAsync(Product product);
        Task<Product> UpdateProductAsync(int id, Product product);
        Task<bool> DeleteProductAsync(int id);
        Task<IEnumerable<Product>> GetProductsByCategoryAsync(int categoryId);
        Task<IEnumerable<Product>> SearchProductsAsync(string keyword);
    }

    public class ProductDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public decimal Price { get; set; }
        public string? Description { get; set; }
        public List<string>? ImageUrls { get; set; }
        public int Instock { get; set; }
        public int? Discount { get; set; }
        public decimal PriceAfterDiscount { get; set; }
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
    }
}

