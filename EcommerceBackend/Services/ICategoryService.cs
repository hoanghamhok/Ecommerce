using Models;

namespace Services
{
    public interface ICategoryService
    {
        Task<Category> CreateCategoryAsync(CategoryRequest request);
        Task<Category?> GetCategoryByIdAsync(int id);
        Task<IEnumerable<Category>> GetAllCategoriesAsync();
        Task<Category> UpdateCategoryAsync(int id, CategoryRequest request);
        Task<bool> DeleteCategoryAsync(int id);
    }

    public class CategoryRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}

