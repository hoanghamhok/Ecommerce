using EcommerceBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
// using EcommerceBackend.Data;
using System.Security.Claims;

namespace Controllers
{
    [ApiController]
    [Route("api/chatbotadvisor")]
    public class ChatbotAdvisorController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChatbotAdvisorController(AppDbContext context)
        {
            _context = context;
        }

        //Gọi Chatbot Advisor
        [HttpPost]
        public async Task<IActionResult> GetChatbotAdvice([FromBody] ChatRequest request)
        {
            string link = "http://127.0.0.1:5001/chat";

            using var client = new HttpClient();

            var payload = new { question = request.question }; // same as Python expects
            var response = await client.PostAsJsonAsync(link, payload);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<ChatResponse>();

            return Ok(result);
        }

        // Helper class to deserialize Python API response
        public class ChatResponse
        {
            public string answer { get; set; }
        }
    }
}   