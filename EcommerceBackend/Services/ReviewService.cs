using Microsoft.EntityFrameworkCore;
using System;
using DTOs;
using Models;

namespace Services
{
    public class ReviewService : IReviewService
    {
        private readonly AppDbContext _context;

        public ReviewService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ReviewDto>> GetProductReviewsAsync(int productId, int page = 1, int pageSize = 10)
        {
            return await _context.Reviews
                .Where(r => r.ProductId == productId)
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new ReviewDto
                {
                    Id = r.Id,
                    ProductId = r.ProductId,
                    UserId = r.UserId,
                    UserName = r.User.Username ?? "Ẩn danh",
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    IsVerifiedPurchase = r.IsVerifiedPurchase
                })
                .ToListAsync();
        }

        public async Task<ProductRatingDto> GetProductRatingAsync(int productId)
        {
            var productRating = await _context.ProductRatings
                .FirstOrDefaultAsync(pr => pr.ProductId == productId);

            if (productRating == null)
            {
                // Tính toán lại nếu chưa có
                await UpdateProductRatingAsync(productId);
                productRating = await _context.ProductRatings
                    .FirstOrDefaultAsync(pr => pr.ProductId == productId);
            }

            return new ProductRatingDto
            {
                ProductId = productId,
                AverageRating = productRating?.AverageRating ?? 0,
                TotalReviews = productRating?.TotalReviews ?? 0,
                RatingDistribution = new Dictionary<int, int>
                {
                    { 1, productRating?.Rating1Star ?? 0 },
                    { 2, productRating?.Rating2Star ?? 0 },
                    { 3, productRating?.Rating3Star ?? 0 },
                    { 4, productRating?.Rating4Star ?? 0 },
                    { 5, productRating?.Rating5Star ?? 0 }
                }
            };
        }

        public async Task<ReviewDto> CreateReviewAsync(int userId, CreateReviewDto createReviewDto)
        {
            // Kiểm tra user đã review chưa
            var existingReview = await _context.Reviews
                .FirstOrDefaultAsync(r => r.UserId == userId && r.ProductId == createReviewDto.ProductId);

            if (existingReview != null)
            {
                throw new InvalidOperationException("Bạn đã đánh giá sản phẩm này rồi");
            }

            // Kiểm tra user đã mua sản phẩm chưa
            var hasPurchase = await _context.OrderDetails
                .Include(oi => oi.Order)
                .AnyAsync(oi => oi.ProductId == createReviewDto.ProductId && 
                               oi.Order.UserId == userId && 
                               oi.Order.Status == "Completed");

            var review = new Review
            {
                ProductId = createReviewDto.ProductId,
                UserId = userId,
                Rating = createReviewDto.Rating,
                Comment = createReviewDto.Comment,
                IsVerifiedPurchase = hasPurchase,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // Cập nhật rating tổng hợp
            await UpdateProductRatingAsync(createReviewDto.ProductId);

            return await GetReviewDtoAsync(review.Id);
        }

        public async Task<ReviewDto> UpdateReviewAsync(int reviewId, int userId, UpdateReviewDto updateReviewDto)
        {
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.Id == reviewId && r.UserId == userId);

            if (review == null)
            {
                throw new ArgumentException("Review không tồn tại hoặc bạn không có quyền chỉnh sửa");
            }

            if (updateReviewDto.Rating.HasValue)
                review.Rating = updateReviewDto.Rating.Value;

            if (!string.IsNullOrEmpty(updateReviewDto.Comment))
                review.Comment = updateReviewDto.Comment;

            review.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Cập nhật rating tổng hợp
            await UpdateProductRatingAsync(review.ProductId);

            return await GetReviewDtoAsync(reviewId);
        }

        public async Task<bool> DeleteReviewAsync(int reviewId, int userId)
        {
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.Id == reviewId && r.UserId == userId);

            if (review == null)
                return false;

            var productId = review.ProductId;
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            // Cập nhật rating tổng hợp
            await UpdateProductRatingAsync(productId);

            return true;
        }

        public async Task<bool> CanUserReviewProductAsync(int userId, int productId)
        {
            // Kiểm tra đã review chưa
            var hasReviewed = await _context.Reviews
                .AnyAsync(r => r.UserId == userId && r.ProductId == productId);

            return !hasReviewed;
        }

        public async Task<ReviewDto> GetUserReviewForProductAsync(int userId, int productId)
        {
            var review = await _context.Reviews
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.UserId == userId && r.ProductId == productId);

            if (review == null)
                return null;

            return new ReviewDto
            {
                Id = review.Id,
                ProductId = review.ProductId,
                UserId = review.UserId,
                UserName = review.User.Username ?? "Ẩn danh",
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt,
                UpdatedAt = review.UpdatedAt,
                IsVerifiedPurchase = review.IsVerifiedPurchase
            };
        }

        private async Task UpdateProductRatingAsync(int productId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.ProductId == productId)
                .ToListAsync();

            var productRating = await _context.ProductRatings
                .FirstOrDefaultAsync(pr => pr.ProductId == productId);

            if (productRating == null)
            {
                productRating = new ProductRating { ProductId = productId };
                _context.ProductRatings.Add(productRating);
            }

            if (reviews.Any())
            {
                productRating.AverageRating = reviews.Average(r => r.Rating);
                productRating.TotalReviews = reviews.Count;
                productRating.Rating1Star = reviews.Count(r => r.Rating == 1);
                productRating.Rating2Star = reviews.Count(r => r.Rating == 2);
                productRating.Rating3Star = reviews.Count(r => r.Rating == 3);
                productRating.Rating4Star = reviews.Count(r => r.Rating == 4);
                productRating.Rating5Star = reviews.Count(r => r.Rating == 5);
            }
            else
            {
                productRating.AverageRating = 0;
                productRating.TotalReviews = 0;
                productRating.Rating1Star = 0;
                productRating.Rating2Star = 0;
                productRating.Rating3Star = 0;
                productRating.Rating4Star = 0;
                productRating.Rating5Star = 0;
            }

            productRating.LastUpdated = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        private async Task<ReviewDto> GetReviewDtoAsync(int reviewId)
        {
            return await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.Id == reviewId)
                .Select(r => new ReviewDto
                {
                    Id = r.Id,
                    ProductId = r.ProductId,
                    UserId = r.UserId,
                    UserName = r.User.Username ?? "Ẩn danh",
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    IsVerifiedPurchase = r.IsVerifiedPurchase
                })
                .FirstOrDefaultAsync();
        }
    }
}