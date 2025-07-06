import Link from "next/link";

export default function PaymentFail() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem", textAlign: "center" }}>
      <h1 style={{ color: "red" }}>❌ Thanh toán thất bại!</h1>
      <p>Rất tiếc, thanh toán của bạn chưa được xử lý thành công.</p>
      <p>Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>
      <div style={{ marginTop: 30 }}>
        <Link href="/cart">
          <button style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#f60",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}>
            Quay lại giỏ hàng
          </button>
        </Link>
      </div>
    </div>
  );
}
