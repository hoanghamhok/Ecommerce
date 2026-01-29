using Microsoft.AspNetCore.Mvc;
using Services;

namespace Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [HttpPost("view/{productId:int}")]
        public async Task<IActionResult> TrackView([FromRoute] int productId)
        {
            await _analyticsService.TrackViewAsync(productId);
            return Ok();
        }

        [HttpGet("summary")]
        public async Task<IActionResult> Summary()
        {
            var data = await _analyticsService.GetSummaryAsync();
            return Ok(data);
        }
    }
}
