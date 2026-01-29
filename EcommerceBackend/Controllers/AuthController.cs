using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using Services;

[ApiController]
[Route("api/auth")]
public class AuthController : Controller
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    //API đăng nhập
    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _authService.LoginAsync(request.Username, request.Password);
            return Ok(new { Token = result.Token, User = result.User });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { title = ex.Message });
        }
    }

    [HttpGet("google-login")]
    public IActionResult GoogleLogin()
    {
        var redirectUrl = Url.Action("GoogleResponse", "Auth");
        var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("google-callback")]
    public async Task<IActionResult> GoogleResponse()
    {
        var authenticateResult = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        if (!authenticateResult.Succeeded)
            return BadRequest("Google authentication failed.");

        var claims = authenticateResult.Principal.Identities.First().Claims.ToList();
        var email = claims.FirstOrDefault(c => c.Type.Contains("email"))?.Value;
        var name = claims.FirstOrDefault(c => c.Type.Contains("name"))?.Value;

        var token = await _authService.GenerateJwtTokenFromGoogleAsync(email!, name!);

        var frontendUrl = $"http://localhost:3000/auth/callback?token={token}";
        return Redirect(frontendUrl);
    }
}

