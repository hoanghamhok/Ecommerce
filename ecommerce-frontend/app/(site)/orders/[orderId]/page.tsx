'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Clock, User, Truck, CreditCard, ArrowLeft } from 'lucide-react';
import ReviewForm from '@/app/(site)/shop/product/[id]/ReviewForm';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId?.toString();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Không tìm thấy mã đơn hàng');
      setLoading(false);
      return;
    }

    const fetchOrderDetail = async () => {
      try {
        const res = await fetch(`http://localhost:5091/api/Order/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!res.ok) throw new Error('Lỗi khi tải chi tiết đơn hàng');
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 text-red-600 px-8 py-6 rounded-2xl shadow text-center">
        <p className="text-lg font-semibold">{error}</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Quay lại
        </button>
      </div>
    </div>
  );

  if (!order) return <p>Không tìm thấy đơn hàng.</p>;

  const statusColor: Record<'Completed' | 'Pending' | 'Cancelled' | 'Processing', string> = {
    'Completed': 'bg-green-100 text-green-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'Processing': 'bg-blue-100 text-blue-800'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Quay lại
          </button>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${statusColor[order.status as keyof typeof statusColor]}`}>
            {order.status}
          </div>
        </div>

        {/* Order Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {/* Order Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Đơn hàng #{order.orderId}</h1>
              <p className="text-gray-500 mt-1">
                Đặt lúc {new Date(order.orderDate).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-2xl font-bold text-emerald-600">
                {order.totalAmount.toLocaleString()}₫
              </p>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer Info */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="flex items-center text-lg font-semibold mb-4">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                Thông tin khách hàng
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">Tên:</span> {order.customerName || 'Khách hàng'}</p>
                <p><span className="font-medium">Email:</span> {order.customerEmail}</p>
                <p><span className="font-medium">Điện thoại:</span> {order.phoneNumber}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="flex items-center text-lg font-semibold mb-4">
                <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
                Tóm tắt đơn hàng
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">Phương thức thanh toán:</span> COD</p>
                <p><span className="font-medium">Vận chuyển:</span> Giao Hàng Nhanh</p>
                {/* <p><span className="font-medium">Địa chỉ giao hàng:</span> {order.shippingAddress}</p> */}
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Chi tiết sản phẩm</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sản phẩm</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Đơn giá</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Số lượng</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Thành tiền</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Đánh giá</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item: any) => (
                    <tr key={item.productId} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{item.productName}</td>
                      <td className="px-4 py-3 text-right text-sm">{item.unitPrice.toLocaleString()}₫</td>
                      <td className="px-4 py-3 text-right text-sm">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        {(item.unitPrice * item.quantity).toLocaleString()}₫
                      </td>
                      <td className="px-4 py-3 text-right text-sm"><ReviewForm productId={item.productId} /></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium">Tổng cộng</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-emerald-600">
                      {order.totalAmount.toLocaleString()}₫
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Payment & Shipping */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="flex items-center text-lg font-semibold mb-4">
              <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
              Thanh toán
            </h3>
            <div className="space-y-2">
              <p>Phương thức: Thanh toán khi nhận hàng</p>
              <p>Trạng thái: Đang đợi...</p>
              <p>Ngày thanh toán: {new Date(order.paymentDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="flex items-center text-lg font-semibold mb-4">
              <Truck className="w-5 h-5 mr-2 text-blue-500" />
              Vận chuyển
            </h3>
            <div className="space-y-2">
              <p>Đơn vị: Giao Hàng Nhanh</p>
              <p>Trạng thái: Đang vận chuyển</p>
              <p>Dự kiến giao: ~3 ngày sau khi đặt hàng thành công</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
