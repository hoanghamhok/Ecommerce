using EcommerceBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
// using BE.Data;
using System.Security.Claims;

namespace Controllers
{
    [ApiController]
    [Route("api/predictionmodels")]
    public class PredictionModelController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PredictionModelController(AppDbContext context)
        {
            _context = context;
        }

        //Gọi mô hình dự đoán (PredictionModel)
        [HttpPost]
        public IActionResult GetCategoryPrediction()
        {
            
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
            {
                // Nếu chưa đăng nhập thì trả về danh mục phổ biến nhất
                var mostCommonCategory = _context.Orders
                    .Join(_context.OrderDetails,
                        o => o.OrderId,
                        od => od.OrderId,
                        (o, od) => new { o, od })
                    .Join(_context.Products,
                        combined => combined.od.ProductId,
                        p => p.Id,
                        (combined, p) => new { combined.o, combined.od, p })
                    .GroupBy(x => x.p.Category)
                    .Select(g => new
                    {
                        Category = g.Key,
                        TotalQuantity = g.Sum(x => x.od.Quantity)
                    })
                    .OrderByDescending(g => g.TotalQuantity)
                    .FirstOrDefault()?.Category;

                if (mostCommonCategory == null)
                    return Ok(new { prediction = "smart device" }); // Mặc định nếu không có dữ liệu

                return Ok(new { prediction = mostCommonCategory });
            }
            // Logic gọi mô hình dự đoán 
            var user = _context.Users.Where(u => u.Id.ToString() == userId).FirstOrDefault();
            if (user == null){
                return NotFound("User not found.");
            }
            string? gender = user.Gender;
            int? age = user.Age;
            var favCategory = _context.Orders
                .Where(o => o.UserId.ToString() == userId)
                .Join(_context.OrderDetails,
                      o => o.OrderId,
                      od => od.OrderId,
                      (o, od) => new { o, od })
                .Join(_context.Products,
                      combined => combined.od.ProductId,
                      p => p.Id,
                      (combined, p) => new { combined.o, combined.od, p })
                .GroupBy(x => x.p.Category)
                .Select(g => new
                {
                    Category = g.Key,
                    TotalQuantity = g.Sum(x => x.od.Quantity)
                })
                .OrderByDescending(g => g.TotalQuantity)
                .FirstOrDefault()?.Category;

            decimal? avgSpend = _context.Orders
                .Where(o => o.UserId.ToString() == userId)
                .Join(_context.OrderDetails,
                      o => o.OrderId,
                      od => od.OrderId,
                      (o, od) => new { o, od })
                .Join(_context.Products,
                      combined => combined.od.ProductId,
                      p => p.Id,
                      (combined, p) => new { combined.o, combined.od, p })
                .Average(x => (decimal?)(x.od.Quantity * x.p.Price));

            // Gọi mô hình dự đoán với dữ liệu người dùng
            var requestData = new
            {
                features = new
                { gender, age, fav_category = favCategory,avg_spend = avgSpend }
            };
            
            // Fake data để test
            // var requestData1 = new
            // {
            //     features = new
            //     {
            //         gender = "Male",
            //         age = 25,
            //         fav_category = "kitchen",
            //         avg_spend = 100
            //     }
            // };
            string link = "http://127.0.0.1:5000/predict";
            var client = new HttpClient();
            var response = client.PostAsJsonAsync(link, requestData).Result;

            return Ok(response.Content.ReadAsStringAsync().Result);
        }
    }
}

