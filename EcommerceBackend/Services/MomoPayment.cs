using System.Security.Cryptography;
using System.Text;
using Newtonsoft.Json;
// Add the correct namespace for Order if it exists, for example:
using Models;

public class MomoPaymentService
{
    private readonly IConfiguration _config;
    public MomoPaymentService(IConfiguration config) => _config = config;

    public string CreateSignature(string rawData, string secretKey)
    {
        using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey)))
        {
            byte[] hashValue = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            return BitConverter.ToString(hashValue).Replace("-", "").ToLower();
        }
    }

    public async Task<string> CreatePaymentUrl(Order order, HttpContext httpContext)
    {
        string endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";

        var partnerCode = _config["Momo:PartnerCode"];
        var accessKey = _config["Momo:AccessKey"];
        var secretKey = _config["Momo:SecretKey"];
        var returnUrl = _config["Momo:ReturnUrl"];
        var notifyUrl = _config["Momo:NotifyUrl"];

        var requestId = Guid.NewGuid().ToString();
        var orderInfo = $"Thanh toán đơn hàng #{order.OrderId}";
        var amount = order.TotalAmount.ToString("0");

        var rawData = $"accessKey={accessKey}&amount={amount}&extraData=&ipnUrl={notifyUrl}&orderId={order.OrderId}&orderInfo={orderInfo}&partnerCode={partnerCode}&redirectUrl={returnUrl}&requestId={requestId}&requestType=captureWallet";
        var signature = CreateSignature(rawData, secretKey);

        var body = new
        {
            partnerCode,
            accessKey,
            requestId,
            amount,
            orderId = order.OrderId.ToString(),
            orderInfo,
            redirectUrl = returnUrl,
            ipnUrl = notifyUrl,
            extraData = "",
            requestType = "captureWallet",
            signature,
            lang = "vi"
        };

        var client = new HttpClient();
        var response = await client.PostAsync(endpoint,
            new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json"));

        var responseBody = await response.Content.ReadAsStringAsync();
        dynamic result = JsonConvert.DeserializeObject(responseBody);

        return result.payUrl;
    }
}
