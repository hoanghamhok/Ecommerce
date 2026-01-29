using Microsoft.AspNetCore.Mvc;
using Services;

namespace Controllers
{
    [ApiController]
    [Route("api/categories")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        //Tạo mới danh mục
        [HttpPost]
        public async Task<ActionResult<Models.Category>> CreateCategory([FromBody] CategoryRequest request)
        {
            try
            {
                var category = await _categoryService.CreateCategoryAsync(request);
                return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        //Lấy danh mục theo id
        [HttpGet("{id}")]
        public async Task<ActionResult<Models.Category>> GetCategory(int id)
        {
            var category = await _categoryService.GetCategoryByIdAsync(id);
            if (category == null)
                return NotFound();
            return category;
        }

        //Lấy toàn bộ danh mục
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Models.Category>>> GetAllCategories()
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        //Cập nhật danh mục
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryRequest request)
        {
            try
            {
                var category = await _categoryService.UpdateCategoryAsync(id, request);
                return Ok(new { message = "Cập nhật Category thành công." });
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
        }

        //Xóa danh mục
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var deleted = await _categoryService.DeleteCategoryAsync(id);
            if (!deleted)
                return NotFound();

            return Ok(new { message = "Xóa Category thành công." });
        }
    }
}
