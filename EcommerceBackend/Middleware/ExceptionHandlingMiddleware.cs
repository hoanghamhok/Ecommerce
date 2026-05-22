using System.Net;
using System.Text.Json;

namespace Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception while processing {Method} {Path}",
                    context.Request.Method,
                    context.Request.Path);

                var (statusCode, message) = ex switch
                {
                    ArgumentException => (HttpStatusCode.BadRequest, ex.Message),
                    InvalidOperationException => (HttpStatusCode.BadRequest, ex.Message),
                    UnauthorizedAccessException => (HttpStatusCode.Unauthorized, ex.Message),
                    _ => (HttpStatusCode.InternalServerError, "Unexpected server error.")
                };

                context.Response.StatusCode = (int)statusCode;
                context.Response.ContentType = "application/json";

                var payload = JsonSerializer.Serialize(new
                {
                    message,
                    traceId = context.TraceIdentifier
                });

                await context.Response.WriteAsync(payload);
            }
        }
    }
}
