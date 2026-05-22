'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5091';
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (orderId) {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("ChÆ°a Ä‘Äƒng nháº­p.");
      return;
    }

    fetch(`${API_BASE}/api/order/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng");
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

  if (loading) return <p>â³ Äang táº£i Ä‘Æ¡n hÃ ng...</p>;
  if (!order) return <p>âŒ KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng hoáº·c lá»—i khi táº£i dá»¯ liá»‡u.</p>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1>âœ… Thanh toÃ¡n thÃ nh cÃ´ng!</h1>
      <p>Cáº£m Æ¡n <strong>{order.customerName}</strong> Ä‘Ã£ Ä‘áº·t hÃ ng.</p>
      <p>Email: {order.customerEmail} | SÄT: {order.phoneNumber}</p>
      <p>MÃ£ Ä‘Æ¡n hÃ ng: <strong>#{order.orderId}</strong></p>
      <p>NgÃ y Ä‘áº·t: {new Date(order.orderDate).toLocaleString()}</p>

      <h3>Chi tiáº¿t Ä‘Æ¡n hÃ ng:</h3>
      <table border={1} cellPadding="8" cellSpacing="0" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Sáº£n pháº©m</th>
            <th>Sá»‘ lÆ°á»£ng</th>
            <th>ÄÆ¡n giÃ¡</th>
            <th>ThÃ nh tiá»n</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map(item => (
            <tr key={item.productId}>
              <td>{item.productName}</td>
              <td>{item.quantity}</td>
              <td>{item.unitPrice.toLocaleString()}â‚«</td>
              <td>{item.total.toLocaleString()}â‚«</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ textAlign: "right", marginTop: 20 }}>
        Tá»•ng cá»™ng: {order.totalAmount.toLocaleString()}â‚«
      </h3>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<p>Loading payment result...</p>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
