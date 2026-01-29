using System.Security.Cryptography;
using System.Text;
using Newtonsoft.Json;
using Models;
using Microsoft.AspNetCore.Http;

public class MomoPaymentService
{
    private readonly IConfiguration _config;

    public MomoPaymentService(IConfiguration config)
    {
        _config = config;
    }

    public async Task<string> CreatePaymentUrl(Order order, HttpContext httpContext)
    {
        var endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
        var partnerCode = _config["Momo:PartnerCode"];
        var accessKey = _config["Momo:AccessKey"];
        var secretKey = _config["Momo:SecretKey"];
        var redirectUrl = _config["Momo:ReturnUrl"];
        var ipnUrl = _config["Momo:NotifyUrl"];

        string orderId = Guid.NewGuid().ToString();
        string requestId = Guid.NewGuid().ToString();
        string orderInfo = $"Thanh toán đơn hàng #{order.OrderId}";
        string amount = ((int)order.TotalAmount).ToString();
        string extraData = ""; // nếu cần truyền gì thêm

        // Raw string để tạo signature
        string rawHash = $"accessKey={accessKey}&amount={amount}&extraData={extraData}" +
                         $"&ipnUrl={ipnUrl}&orderId={orderId}&orderInfo={orderInfo}" +
                         $"&partnerCode={partnerCode}&redirectUrl={redirectUrl}" +
                         $"&requestId={requestId}&requestType=captureWallet";

        // Tạo chữ ký
        string signature;
        using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey)))
        {
            var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawHash));
            signature = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
        }

        var requestData = new
        {
            partnerCode,
            accessKey,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            requestType = "captureWallet",
            signature,
            lang = "vi"
        };

        var client = new HttpClient();
        var response = await client.PostAsync(endpoint,
            new StringContent(JsonConvert.SerializeObject(requestData), Encoding.UTF8, "application/json"));

        var responseBody = await response.Content.ReadAsStringAsync();
        dynamic momoResponse = JsonConvert.DeserializeObject(responseBody);

        return momoResponse.payUrl;
    }
}

