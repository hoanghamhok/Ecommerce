'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5091';

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
      setError('KhÃ´ng tÃ¬m tháº¥y mÃ£ Ä‘Æ¡n hÃ ng');
      setLoading(false);
      return;
    }

    const fetchOrderDetail = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/Order/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!res.ok) throw new Error('Lá»—i khi táº£i chi tiáº¿t Ä‘Æ¡n hÃ ng');
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
          Quay láº¡i
        </button>
      </div>
    </div>
  );

  if (!order) return <p>KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng.</p>;

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
            Quay láº¡i
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
              <h1 className="text-3xl font-bold text-gray-900">ÄÆ¡n hÃ ng #{order.orderId}</h1>
              <p className="text-gray-500 mt-1">
                Äáº·t lÃºc {new Date(order.orderDate).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-2xl font-bold text-emerald-600">
                {order.totalAmount.toLocaleString()}â‚«
              </p>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer Info */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="flex items-center text-lg font-semibold mb-4">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                ThÃ´ng tin khÃ¡ch hÃ ng
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">TÃªn:</span> {order.customerName || 'KhÃ¡ch hÃ ng'}</p>
                <p><span className="font-medium">Email:</span> {order.customerEmail}</p>
                <p><span className="font-medium">Äiá»‡n thoáº¡i:</span> {order.phoneNumber}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="flex items-center text-lg font-semibold mb-4">
                <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
                TÃ³m táº¯t Ä‘Æ¡n hÃ ng
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">PhÆ°Æ¡ng thá»©c thanh toÃ¡n:</span> COD</p>
                <p><span className="font-medium">Váº­n chuyá»ƒn:</span> Giao HÃ ng Nhanh</p>
                {/* <p><span className="font-medium">Äá»‹a chá»‰ giao hÃ ng:</span> {order.shippingAddress}</p> */}
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Chi tiáº¿t sáº£n pháº©m</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sáº£n pháº©m</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">ÄÆ¡n giÃ¡</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Sá»‘ lÆ°á»£ng</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">ThÃ nh tiá»n</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">ÄÃ¡nh giÃ¡</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item: any) => (
                    <tr key={item.productId} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{item.productName}</td>
                      <td className="px-4 py-3 text-right text-sm">{item.unitPrice.toLocaleString()}â‚«</td>
                      <td className="px-4 py-3 text-right text-sm">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        {(item.unitPrice * item.quantity).toLocaleString()}â‚«
                      </td>
                      <td className="px-4 py-3 text-right text-sm"><ReviewForm productId={item.productId} /></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium">Tá»•ng cá»™ng</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-emerald-600">
                      {order.totalAmount.toLocaleString()}â‚«
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
              Thanh toÃ¡n
            </h3>
            <div className="space-y-2">
              <p>PhÆ°Æ¡ng thá»©c: Thanh toÃ¡n khi nháº­n hÃ ng</p>
              <p>Tráº¡ng thÃ¡i: Äang Ä‘á»£i...</p>
              <p>NgÃ y thanh toÃ¡n: {new Date(order.paymentDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="flex items-center text-lg font-semibold mb-4">
              <Truck className="w-5 h-5 mr-2 text-blue-500" />
              Váº­n chuyá»ƒn
            </h3>
            <div className="space-y-2">
              <p>ÄÆ¡n vá»‹: Giao HÃ ng Nhanh</p>
              <p>Tráº¡ng thÃ¡i: Äang váº­n chuyá»ƒn</p>
              <p>Dá»± kiáº¿n giao: ~3 ngÃ y sau khi Ä‘áº·t hÃ ng thÃ nh cÃ´ng</p>
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

// const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5091';

// type OrderDetailDto = {
//   orderId: number;
//   productId: number;
//   productName: string;
//   unitPrice?: number; // <-- optional Ä‘á»ƒ trÃ¡nh crash
//   quantity?: number;  // <-- optional Ä‘á»ƒ trÃ¡nh crash
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
//       setError('KhÃ´ng tÃ¬m tháº¥y mÃ£ Ä‘Æ¡n hÃ ng');
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
//         if (!res.ok) throw new Error('Lá»—i khi táº£i chi tiáº¿t Ä‘Æ¡n hÃ ng');
//         const data: OrderDto = await res.json();

//         // âœ… Fallback shipping tá»« localStorage náº¿u BE chÆ°a map Ä‘á»§
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
//         setError(err.message || 'CÃ³ lá»—i xáº£y ra');
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
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">CÃ³ lá»—i xáº£y ra</h2>
//           <p className="text-gray-600 mb-6">{error}</p>
//           <div className="flex gap-3 justify-center">
//             <button
//               onClick={() => router.back()}
//               className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors duration-200 font-medium"
//             >
//               Quay láº¡i
//             </button>
//             <button
//               onClick={() => router.push('/orders')}
//               className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors duration-200 font-medium"
//             >
//               Danh sÃ¡ch Ä‘Æ¡n hÃ ng
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
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng</h2>
//           <p className="text-gray-600 mb-6">ÄÆ¡n hÃ ng báº¡n Ä‘ang tÃ¬m kiáº¿m khÃ´ng tá»“n táº¡i hoáº·c Ä‘Ã£ bá»‹ xÃ³a.</p>
//           <button
//             onClick={() => router.push('/orders')}
//             className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
//           >
//             Quay láº¡i danh sÃ¡ch
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
//     Completed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'HoÃ n thÃ nh' },
//     Pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Chá» xá»­ lÃ½' },
//     Cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: Clock, label: 'ÄÃ£ há»§y' },
//     Processing: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package, label: 'Äang xá»­ lÃ½' },
//     Shipped: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck, label: 'Äang giao hÃ ng' }
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
//               <span className="font-medium">Quay láº¡i</span>
//             </button>
//             <div>
//               <h1 className="text-3xl md:text-4xl font-bold text-gray-900">ÄÆ¡n hÃ ng #{order.orderId}</h1>
//               <p className="text-gray-600 mt-1 flex items-center gap-2">
//                 <Calendar className="w-4 h-4" />
//                 Äáº·t lÃºc {createdAt ? new Date(createdAt).toLocaleDateString('vi-VN', {
//                   year: 'numeric',
//                   month: 'long',
//                   day: 'numeric',
//                   hour: '2-digit',
//                   minute: '2-digit'
//                 }) : 'â€”'}
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
//                 {safeTotal.toLocaleString()}â‚«
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
//                   Chi tiáº¿t sáº£n pháº©m
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
//                                 <span className="text-gray-500">ÄÆ¡n giÃ¡: </span>
//                                 <span className="font-semibold text-gray-900">
//                                   {unit.toLocaleString()}â‚«
//                                 </span>
//                               </div>
//                               <div>
//                                 <span className="text-gray-500">Sá»‘ lÆ°á»£ng: </span>
//                                 <span className="font-semibold text-gray-900">{qty}</span>
//                               </div>
//                             </div>
//                             <div className="text-right">
//                               <p className="text-lg font-bold text-blue-600">
//                                 {line.toLocaleString()}â‚«
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
//                   <div className="p-6 text-gray-500">KhÃ´ng cÃ³ sáº£n pháº©m trong Ä‘Æ¡n hÃ ng.</div>
//                 )}
//               </div>

//               {/* Order Summary */}
//               <div className="p-6 bg-gray-50 border-t border-gray-200">
//                 <div className="space-y-3 max-w-md ml-auto">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Táº¡m tÃ­nh ({order.orderDetails?.length || 0} sáº£n pháº©m)</span>
//                     <span className="font-medium">{safeTotal.toLocaleString()}â‚«</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">PhÃ­ váº­n chuyá»ƒn</span>
//                     <span className="font-medium text-green-600">Miá»…n phÃ­</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Giáº£m giÃ¡</span>
//                     <span className="font-medium">0â‚«</span>
//                   </div>
//                   <div className="border-t border-gray-300 pt-3">
//                     <div className="flex justify-between items-center">
//                       <span className="text-lg font-bold text-gray-900">Tá»•ng cá»™ng</span>
//                       <span className="text-2xl font-bold text-blue-600">
//                         {safeTotal.toLocaleString()}â‚«
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
//                 ThÃ´ng tin khÃ¡ch hÃ ng
//               </h3>
//               <div className="space-y-3">
//                 <div className="flex items-center gap-3">
//                   <User className="w-4 h-4 text-gray-400" />
//                   <div>
//                     <p className="font-medium text-gray-900">{order.fullName || 'KhÃ¡ch hÃ ng'}</p>
//                     <p className="text-sm text-gray-500">TÃªn khÃ¡ch hÃ ng</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Mail className="w-4 h-4 text-gray-400" />
//                   <div>
//                     <p className="font-medium text-gray-900">{order.email || 'â€”'}</p>
//                     <p className="text-sm text-gray-500">Email</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Phone className="w-4 h-4 text-gray-400" />
//                   <div>
//                     <p className="font-medium text-gray-900">{order.phone || 'â€”'}</p>
//                     <p className="text-sm text-gray-500">Sá»‘ Ä‘iá»‡n thoáº¡i</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Shipping Address */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <Home className="w-5 h-5 text-blue-600" />
//                 Äá»‹a chá»‰ giao hÃ ng
//               </h3>
//               <div className="space-y-3 text-sm">
//                 <div className="flex items-start gap-3">
//                   <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
//                   <div className="font-medium text-gray-900">
//                     {[order.address, order.ward, order.district, order.city]
//                       .filter(Boolean)
//                       .join(', ') || 'â€”'}
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
//                 Thanh toÃ¡n
//               </h3>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">PhÆ°Æ¡ng thá»©c</span>
//                   <span className="font-medium text-gray-900">
//                     {payMethod === 'banking'
//                       ? 'Chuyá»ƒn khoáº£n'
//                       : payMethod === 'card'
//                       ? 'Tháº» tÃ­n dá»¥ng/Ghi ná»£'
//                       : payMethod === 'momo'
//                       ? 'MoMo'
//                       : 'COD'}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Tráº¡ng thÃ¡i</span>
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs font-medium ${
//                       order.status === 'Completed'
//                         ? 'bg-green-100 text-green-800'
//                         : 'bg-yellow-100 text-yellow-800'
//                     }`}
//                   >
//                     {order.status === 'Completed' ? 'ÄÃ£ thanh toÃ¡n' : 'Chá» thanh toÃ¡n'}
//                   </span>
//                 </div>
//                 {order.paymentDate && (
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">NgÃ y thanh toÃ¡n</span>
//                     <span className="font-medium text-gray-900">
//                       {new Date(order.paymentDate).toLocaleDateString('vi-VN')}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Order Timeline */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Lá»‹ch sá»­ Ä‘Æ¡n hÃ ng</h3>
//               <div className="space-y-4">
//                 <div className="flex items-start gap-3">
//                   <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
//                   <div>
//                     <p className="font-medium text-gray-900">ÄÆ¡n hÃ ng Ä‘Æ°á»£c táº¡o</p>
//                     <p className="text-sm text-gray-500">
//                       {createdAt
//                         ? new Date(createdAt).toLocaleDateString('vi-VN', {
//                             year: 'numeric',
//                             month: 'long',
//                             day: 'numeric',
//                             hour: '2-digit',
//                             minute: '2-digit'
//                           })
//                         : 'â€”'}
//                     </p>
//                   </div>
//                 </div>
//                 {order.status === 'Completed' && (
//                   <div className="flex items-start gap-3">
//                     <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
//                     <div>
//                       <p className="font-medium text-gray-900">ÄÆ¡n hÃ ng hoÃ n thÃ nh</p>
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




