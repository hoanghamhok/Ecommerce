'use client';
import { useEffect, useState } from "react";
import { useRouter,useSearchParams } from "next/navigation";

type OrderItem = {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type Order = {
  orderId: number;
  customerName: string;
  customerEmail: string;
  phoneNumber: string;
  orderDate: string;
  items: OrderItem[];
  totalAmount: number;
};

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (orderId) {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Chưa đăng nhập.");
      return;
    }

    fetch(`https://localhost:5091/api/order/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Không tìm thấy đơn hàng");
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => {
        setOrder(null);
        setLoading(false);
      });
  }
}, [orderId]);

  if (loading) return <p>⏳ Đang tải đơn hàng...</p>;
  if (!order) return <p>❌ Không tìm thấy đơn hàng hoặc lỗi khi tải dữ liệu.</p>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1>✅ Thanh toán thành công!</h1>
      <p>Cảm ơn <strong>{order.customerName}</strong> đã đặt hàng.</p>
      <p>Email: {order.customerEmail} | SĐT: {order.phoneNumber}</p>
      <p>Mã đơn hàng: <strong>#{order.orderId}</strong></p>
      <p>Ngày đặt: {new Date(order.orderDate).toLocaleString()}</p>

      <h3>Chi tiết đơn hàng:</h3>
      <table border={1} cellPadding="8" cellSpacing="0" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Số lượng</th>
            <th>Đơn giá</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map(item => (
            <tr key={item.productId}>
              <td>{item.productName}</td>
              <td>{item.quantity}</td>
              <td>{item.unitPrice.toLocaleString()}₫</td>
              <td>{item.total.toLocaleString()}₫</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ textAlign: "right", marginTop: 20 }}>
        Tổng cộng: {order.totalAmount.toLocaleString()}₫
      </h3>
    </div>
  );
}
