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


// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import ReviewForm from '@/app/(site)/shop/product/[id]/ReviewForm';
// import {
//   CheckCircle,
//   Clock,
//   User,
//   Truck,
//   CreditCard,
//   ArrowLeft,
//   Package,
//   MapPin,
//   Phone,
//   Mail,
//   Calendar,
//   ShoppingBag,
//   Home
// } from 'lucide-react';

// const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5091';

// type OrderDetailDto = {
//   orderId: number;
//   productId: number;
//   productName: string;
//   unitPrice?: number; // <-- optional để tránh crash
//   quantity?: number;  // <-- optional để tránh crash
//   imageUrl?: string | null;
//   product?: {
//     name?: string;
//     imageUrls?: string | string[];
//     imageUrl?: string;
//     imageurl?: string;
//   } | null;
// };

// type OrderDto = {
//   orderId: number;
//   createdAt?: string;
//   totalAmount?: number;
//   status: string;
//   orderDetails: OrderDetailDto[];

//   // shipping fields
//   fullName?: string;
//   email?: string;
//   phone?: string;
//   address?: string;
//   city?: string;
//   district?: string;
//   ward?: string;
//   note?: string;

//   // optional
//   paymentMethod?: string | null;
//   paymentDate?: string | null;
//   updatedAt?: string | null;
// };

// function resolveImgUrl(raw?: string | null): string {
//   if (!raw) return '/default-image.png';
//   if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
//   return `${API_BASE}${raw.startsWith('/') ? '' : '/'}${raw}`;
// }

// function pickItemImage(it: OrderDetailDto): string {
//   const flat = it.imageUrl;
//   if (flat) return resolveImgUrl(flat);

//   const p = it.product;
//   if (p?.imageUrl) return resolveImgUrl(p.imageUrl);
//   if ((p as any)?.imageurl) return resolveImgUrl((p as any).imageurl);

//   const v = p?.imageUrls;
//   if (Array.isArray(v) && v.length > 0) return resolveImgUrl(String(v[0]));
//   if (typeof v === 'string' && v) {
//     try {
//       const arr = JSON.parse(v);
//       if (Array.isArray(arr) && arr[0]) return resolveImgUrl(String(arr[0]));
//     } catch {}
//     if (v.includes(',')) return resolveImgUrl(v.split(',')[0].trim());
//     return resolveImgUrl(v);
//   }

//   return '/default-image.png';
// }

// export default function OrderDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const orderId = params?.orderId?.toString();

//   const [order, setOrder] = useState<OrderDto | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!orderId) {
//       setError('Không tìm thấy mã đơn hàng');
//       setLoading(false);
//       return;
//     }

//     const fetchOrderDetail = async () => {
//       try {
//         const res = await fetch(`${API_BASE}/api/Order/${orderId}`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
//           },
//         });
//         if (!res.ok) throw new Error('Lỗi khi tải chi tiết đơn hàng');
//         const data: OrderDto = await res.json();

//         // ✅ Fallback shipping từ localStorage nếu BE chưa map đủ
//         try {
//           const raw = localStorage.getItem(`order:shipping:${orderId}`);
//           if (raw) {
//             const s = JSON.parse(raw);
//             setOrder({
//               ...data,
//               fullName: data.fullName || s.fullName || '',
//               email: data.email || s.email || '',
//               phone: data.phone || s.phone || '',
//               address: data.address || s.address || '',
//               city: data.city || s.city || '',
//               district: data.district || s.district || '',
//               ward: data.ward || s.ward || '',
//               note: data.note || s.note || '',
//             });
//           } else {
//             setOrder(data);
//           }
//         } catch {
//           setOrder(data);
//         }
//       } catch (err: any) {
//         setError(err.message || 'Có lỗi xảy ra');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrderDetail();
//   }, [orderId]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24">
//         <div className="max-w-6xl mx-auto px-6 py-12">
//           <div className="animate-pulse">
//             <div className="h-8 bg-gray-300 rounded-lg w-64 mb-8"></div>
//             <div className="bg-white rounded-2xl p-8 shadow-sm">
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//                 <div className="h-32 bg-gray-300 rounded-xl"></div>
//                 <div className="h-32 bg-gray-300 rounded-xl"></div>
//               </div>
//               <div className="h-64 bg-gray-300 rounded-xl"></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 flex items-center justify-center">
//         <div className="text-center p-8 max-w-md">
//           <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <ShoppingBag className="w-10 h-10 text-red-600" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
//           <p className="text-gray-600 mb-6">{error}</p>
//           <div className="flex gap-3 justify-center">
//             <button
//               onClick={() => router.back()}
//               className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors duration-200 font-medium"
//             >
//               Quay lại
//             </button>
//             <button
//               onClick={() => router.push('/orders')}
//               className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors duration-200 font-medium"
//             >
//               Danh sách đơn hàng
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!order) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 flex items-center justify-center">
//         <div className="text-center p-8 max-w-md">
//           <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <Package className="w-10 h-10 text-gray-400" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
//           <p className="text-gray-600 mb-6">Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
//           <button
//             onClick={() => router.push('/orders')}
//             className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
//           >
//             Quay lại danh sách
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
//     Completed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Hoàn thành' },
//     Pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Chờ xử lý' },
//     Cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: Clock, label: 'Đã hủy' },
//     Processing: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package, label: 'Đang xử lý' },
//     Shipped: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck, label: 'Đang giao hàng' }
//   };

//   const statusInfo = statusConfig[order.status] || statusConfig.Pending;
//   const StatusIcon = statusInfo.icon;

//   const createdAt = order.createdAt || (order as any).orderDate;
//   const payMethod = order.paymentMethod || 'cod';

//   const safeTotal = Number(order.totalAmount ?? 0);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24">
//       <div className="max-w-6xl mx-auto px-6 py-12">
//         {/* Header */}
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => router.back()}
//               className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               <span className="font-medium">Quay lại</span>
//             </button>
//             <div>
//               <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Đơn hàng #{order.orderId}</h1>
//               <p className="text-gray-600 mt-1 flex items-center gap-2">
//                 <Calendar className="w-4 h-4" />
//                 Đặt lúc {createdAt ? new Date(createdAt).toLocaleDateString('vi-VN', {
//                   year: 'numeric',
//                   month: 'long',
//                   day: 'numeric',
//                   hour: '2-digit',
//                   minute: '2-digit'
//                 }) : '—'}
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${statusInfo.color}`}>
//               <StatusIcon className="w-4 h-4" />
//               {statusInfo.label}
//             </div>
//             <div className="text-right">
//               <p className="text-2xl font-bold text-blue-600">
//                 {safeTotal.toLocaleString()}₫
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Main Content Grid */}
//         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
//           {/* Left Column - Order Details */}
//           <div className="xl:col-span-2 space-y-6">
//             {/* Products Card */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//               <div className="p-6 border-b border-gray-200">
//                 <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
//                   <ShoppingBag className="w-5 h-5 text-blue-600" />
//                   Chi tiết sản phẩm
//                 </h2>
//               </div>
//               <div className="divide-y divide-gray-100">
//                 {order.orderDetails?.map((item:any) => {
//                   const unit = Number(item.unitPrice ?? 0);
//                   const qty = Number(item.quantity ?? 0);
//                   const line = unit * qty;
//                   return (
//                     <div key={`${item.productId}`} className="p-6 hover:bg-gray-50 transition-colors duration-150">
//                       <div className="flex items-start gap-4">
//                         <img
//                           src={pickItemImage(item)}
//                           alt={item.productName}
//                           className="w-16 h-16 object-cover rounded-xl bg-gray-100 flex-shrink-0"
//                           onError={(e) => ((e.currentTarget as HTMLImageElement).src = '/default-image.png')}
//                         />
//                         <div className="flex-1 min-w-0">
//                           <h3 className="font-semibold text-gray-900 text-lg mb-1">
//                             {item.productName}
//                           </h3>
//                           <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
//                             <span>SKU: {item.productId}</span>
//                           </div>
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-6 text-sm">
//                               <div>
//                                 <span className="text-gray-500">Đơn giá: </span>
//                                 <span className="font-semibold text-gray-900">
//                                   {unit.toLocaleString()}₫
//                                 </span>
//                               </div>
//                               <div>
//                                 <span className="text-gray-500">Số lượng: </span>
//                                 <span className="font-semibold text-gray-900">{qty}</span>
//                               </div>
//                             </div>
//                             <div className="text-right">
//                               <p className="text-lg font-bold text-blue-600">
//                                 {line.toLocaleString()}₫
//                               </p>
//                             </div>
//                             <td className="px-4 py-3 text-right text-sm"><ReviewForm productId={item.productId} /></td>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//                 {(!order.orderDetails || order.orderDetails.length === 0) && (
//                   <div className="p-6 text-gray-500">Không có sản phẩm trong đơn hàng.</div>
//                 )}
//               </div>

//               {/* Order Summary */}
//               <div className="p-6 bg-gray-50 border-t border-gray-200">
//                 <div className="space-y-3 max-w-md ml-auto">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Tạm tính ({order.orderDetails?.length || 0} sản phẩm)</span>
//                     <span className="font-medium">{safeTotal.toLocaleString()}₫</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Phí vận chuyển</span>
//                     <span className="font-medium text-green-600">Miễn phí</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Giảm giá</span>
//                     <span className="font-medium">0₫</span>
//                   </div>
//                   <div className="border-t border-gray-300 pt-3">
//                     <div className="flex justify-between items-center">
//                       <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
//                       <span className="text-2xl font-bold text-blue-600">
//                         {safeTotal.toLocaleString()}₫
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Sidebar */}
//           <div className="space-y-6">
//             {/* Customer Info */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <User className="w-5 h-5 text-blue-600" />
//                 Thông tin khách hàng
//               </h3>
//               <div className="space-y-3">
//                 <div className="flex items-center gap-3">
//                   <User className="w-4 h-4 text-gray-400" />
//                   <div>
//                     <p className="font-medium text-gray-900">{order.fullName || 'Khách hàng'}</p>
//                     <p className="text-sm text-gray-500">Tên khách hàng</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Mail className="w-4 h-4 text-gray-400" />
//                   <div>
//                     <p className="font-medium text-gray-900">{order.email || '—'}</p>
//                     <p className="text-sm text-gray-500">Email</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Phone className="w-4 h-4 text-gray-400" />
//                   <div>
//                     <p className="font-medium text-gray-900">{order.phone || '—'}</p>
//                     <p className="text-sm text-gray-500">Số điện thoại</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Shipping Address */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <Home className="w-5 h-5 text-blue-600" />
//                 Địa chỉ giao hàng
//               </h3>
//               <div className="space-y-3 text-sm">
//                 <div className="flex items-start gap-3">
//                   <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
//                   <div className="font-medium text-gray-900">
//                     {[order.address, order.ward, order.district, order.city]
//                       .filter(Boolean)
//                       .join(', ') || '—'}
//                   </div>
//                 </div>
//                 {order.note && (
//                   <div className="flex items-start gap-3">
//                     <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5" />
//                     <div className="text-gray-700">{order.note}</div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Payment Info */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <CreditCard className="w-5 h-5 text-blue-600" />
//                 Thanh toán
//               </h3>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Phương thức</span>
//                   <span className="font-medium text-gray-900">
//                     {payMethod === 'banking'
//                       ? 'Chuyển khoản'
//                       : payMethod === 'card'
//                       ? 'Thẻ tín dụng/Ghi nợ'
//                       : payMethod === 'momo'
//                       ? 'MoMo'
//                       : 'COD'}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Trạng thái</span>
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs font-medium ${
//                       order.status === 'Completed'
//                         ? 'bg-green-100 text-green-800'
//                         : 'bg-yellow-100 text-yellow-800'
//                     }`}
//                   >
//                     {order.status === 'Completed' ? 'Đã thanh toán' : 'Chờ thanh toán'}
//                   </span>
//                 </div>
//                 {order.paymentDate && (
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">Ngày thanh toán</span>
//                     <span className="font-medium text-gray-900">
//                       {new Date(order.paymentDate).toLocaleDateString('vi-VN')}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Order Timeline */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử đơn hàng</h3>
//               <div className="space-y-4">
//                 <div className="flex items-start gap-3">
//                   <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
//                   <div>
//                     <p className="font-medium text-gray-900">Đơn hàng được tạo</p>
//                     <p className="text-sm text-gray-500">
//                       {createdAt
//                         ? new Date(createdAt).toLocaleDateString('vi-VN', {
//                             year: 'numeric',
//                             month: 'long',
//                             day: 'numeric',
//                             hour: '2-digit',
//                             minute: '2-digit'
//                           })
//                         : '—'}
//                     </p>
//                   </div>
//                 </div>
//                 {order.status === 'Completed' && (
//                   <div className="flex items-start gap-3">
//                     <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
//                     <div>
//                       <p className="font-medium text-gray-900">Đơn hàng hoàn thành</p>
//                       <p className="text-sm text-gray-500">
//                         {new Date(order.updatedAt || createdAt || Date.now()).toLocaleDateString('vi-VN', {
//                           year: 'numeric',
//                           month: 'long',
//                           day: 'numeric',
//                           hour: '2-digit',
//                           minute: '2-digit'
//                         })}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//           {/* End Right Column */}
//         </div>
//       </div>
//     </div>
//   );
// }

