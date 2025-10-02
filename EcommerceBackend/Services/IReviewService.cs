using DTOs;

namespace Services
{
    public interface IReviewService
    {
        Task<IEnumerable<ReviewDto>> GetProductReviewsAsync(int productId, int page = 1, int pageSize = 10);
        Task<ProductRatingDto> GetProductRatingAsync(int productId);
        Task<ReviewDto> CreateReviewAsync(int userId, CreateReviewDto createReviewDto);
        Task<ReviewDto> UpdateReviewAsync(int reviewId, int userId, UpdateReviewDto updateReviewDto);
        Task<bool> DeleteReviewAsync(int reviewId, int userId);
        Task<bool> CanUserReviewProductAsync(int userId, int productId);
        Task<ReviewDto> GetUserReviewForProductAsync(int userId, int productId);
    }
}