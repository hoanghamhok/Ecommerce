using Microsoft.EntityFrameworkCore;
using Models;

namespace Services
{
    public class ProductService : IProductService
    {
        private readonly AppDbContext _context;

        public ProductService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductDto>> GetProductsAsync()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .ToListAsync();

            return products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Discount = p.Discount,
                Description = p.Description,
                ImageUrls = p.ImageUrls,
                Instock = p.Instock,
                PriceAfterDiscount = p.Discount.HasValue
                    ? Math.Round(p.Price * (1 - (decimal)p.Discount.Value / 100), 0)
                    : p.Price,
                CategoryId = p.CategoryId,
                CategoryName = p.Category != null ? p.Category.Name : null
            });
        }

        public async Task<Product?> GetProductByIdAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Product> CreateProductAsync(Product product)
        {
            var category = await _context.Categories.FindAsync(product.CategoryId);
            if (category == null)
                throw new ArgumentException("CategoryId không hợp lệ!");

            var newProduct = new Product
            {
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                Instock = product.Instock,
                ImageUrls = product.ImageUrls,
                Discount = product.Discount,
                CategoryId = product.CategoryId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(newProduct);
            await _context.SaveChangesAsync();

            newProduct.Category = category;
            return newProduct;
        }

        public async Task<Product> UpdateProductAsync(int id, Product product)
        {
            var existingProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (existingProduct == null)
                throw new ArgumentException("Không tìm thấy sản phẩm.");

            var category = await _context.Categories.FindAsync(product.CategoryId);
            if (category == null)
                throw new ArgumentException("CategoryId không hợp lệ!");

            existingProduct.Name = product.Name;
            existingProduct.Description = product.Description;
            existingProduct.Price = product.Price;
            existingProduct.Instock = product.Instock;
            existingProduct.ImageUrls = product.ImageUrls;
            existingProduct.Discount = product.Discount;
            existingProduct.CategoryId = product.CategoryId;

            await _context.SaveChangesAsync();

            existingProduct.Category = category;
            return existingProduct;
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (product == null)
                return false;

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Product>> GetProductsByCategoryAsync(int categoryId)
        {
            return await _context.Products
                .Where(p => p.CategoryId == categoryId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> SearchProductsAsync(string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
                throw new ArgumentException("Từ khóa không hợp lệ");

            return await _context.Products
                .Where(p => p.Name.Contains(keyword))
                .ToListAsync();
        }
    }
}

