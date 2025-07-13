using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/files")]
public class FileController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    public FileController(IWebHostEnvironment env)
    {
        _env = env;
    }

    // [HttpPost("upload")]
    // public async Task<IActionResult> UploadImage([FromForm] IFormFile file)
    // {
    //     Console.WriteLine("WebRootPath: " + _env.WebRootPath);
    //     if (file == null || file.Length == 0)
    //         return BadRequest("Không có tệp nào được tải lên.");

    //     // Đường dẫn thư mục tải lên (wwwroot/uploads)
    //     var uploadPath = Path.Combine(_env.WebRootPath, "uploads");
    //     if (!Directory.Exists(uploadPath))
    //         Directory.CreateDirectory(uploadPath);

    //     //Tạo tên tệp duy nhất
    //     var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
    //     var filePath = Path.Combine(uploadPath, fileName);

    //     // Lưu tệp vào thư mục
    //     using (var stream = new FileStream(filePath, FileMode.Create))
    //     {
    //         await file.CopyToAsync(stream);
    //     }

    //     // Trả về URL của tệp đã tải lên
    //     var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
    //     return Ok(new { imageUrl = fileUrl });
    // }
    [HttpPost("upload")]
    public async Task<IActionResult> UploadImages([FromForm] List<IFormFile> files)
    {
        Console.WriteLine("WebRootPath: " + _env.WebRootPath);

        if (files == null || files.Count == 0)
            return BadRequest("Không có tệp nào được tải lên.");

        var uploadPath = Path.Combine(_env.WebRootPath, "uploads");
        if (!Directory.Exists(uploadPath))
            Directory.CreateDirectory(uploadPath);

        var uploadedFiles = new List<string>();

        foreach (var file in files)
        {
            if (file.Length > 0)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var filePath = Path.Combine(uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
                uploadedFiles.Add(fileUrl);
            }
        }

        return Ok(new { imageUrls = uploadedFiles });
    }

}