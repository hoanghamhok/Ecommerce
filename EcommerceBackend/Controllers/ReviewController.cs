using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using DTOs;
using Services;


namespace Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // GET: api/review/product/{productId}
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetProductReviews(
            int productId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var reviews = await _reviewService.GetProductReviewsAsync(productId, page, pageSize);
            return Ok(reviews);
        }

        // GET: api/review/product/{productId}/rating
        [HttpGet("product/{productId}/rating")]
        public async Task<ActionResult<ProductRatingDto>> GetProductRating(int productId)
        {
            var rating = await _reviewService.GetProductRatingAsync(productId);
            return Ok(rating);
        }

        // POST: api/review
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ReviewDto>> CreateReview([FromBody] CreateReviewDto createReviewDto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var review = await _reviewService.CreateReviewAsync(userId, createReviewDto);
                return CreatedAtAction(nameof(GetReview), new { id = review.Id }, review);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/review/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ReviewDto>> GetReview(int id)
        {
            // Implementation để get single review
            return Ok();
        }

        // PUT: api/review/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<ReviewDto>> UpdateReview(int id, [FromBody] UpdateReviewDto updateReviewDto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var review = await _reviewService.UpdateReviewAsync(id, userId, updateReviewDto);
                return Ok(review);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/review/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteReview(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var deleted = await _reviewService.DeleteReviewAsync(id, userId);

            if (!deleted)
                return NotFound(new { message = "Review không tồn tại hoặc bạn không có quyền xóa" });

            return NoContent();
        }

        // GET: api/review/user/product/{productId}
        [HttpGet("user/product/{productId}")]
        [Authorize]
        public async Task<ActionResult<ReviewDto>> GetUserReviewForProduct(int productId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var review = await _reviewService.GetUserReviewForProductAsync(userId, productId);

            if (review == null)
                return NotFound();

            return Ok(review);
        }

        // GET: api/review/user/can-review/{productId}
        [HttpGet("user/can-review/{productId}")]
        [Authorize]
        public async Task<ActionResult<bool>> CanUserReviewProduct(int productId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var canReview = await _reviewService.CanUserReviewProductAsync(userId, productId);
            return Ok(new { canReview });
        }
    }
}