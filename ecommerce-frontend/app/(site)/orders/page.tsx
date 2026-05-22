'use client';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5091';
// app/orders/page.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ShoppingBag, 
  ArrowRight, 
  Truck,
  Package,
  Search,
  Filter,
  Calendar,
  DollarSign,
  PackageOpen
} from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/Order`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!res.ok) throw new Error('Lá»—i khi táº£i Ä‘Æ¡n hÃ ng');
        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'Processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'Shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderId.toString().includes(searchTerm) ||
      order.items?.some((item: any) => 
        item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded-lg w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-2xl"></div>
              ))}
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">CÃ³ lá»—i xáº£y ra</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors duration-200 font-medium"
            >
              Thá»­ láº¡i
            </button>
            <button
              onClick={() => router.push('/shop')}
              className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors duration-200 font-medium"
            >
              Mua sáº¯m
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusCounts = {
    all: orders.length,
    Pending: orders.filter(o => o.status === 'Pending').length,
    Processing: orders.filter(o => o.status === 'Processing').length,
    Shipped: orders.filter(o => o.status === 'Shipped').length,
    Completed: orders.filter(o => o.status === 'Completed').length,
    Cancelled: orders.filter(o => o.status === 'Cancelled').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              Lá»‹ch sá»­ Ä‘Æ¡n hÃ ng
            </h1>
            <p className="text-gray-600 mt-2">Theo dÃµi vÃ  quáº£n lÃ½ Ä‘Æ¡n hÃ ng cá»§a báº¡n</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-200">
              {filteredOrders.length} Ä‘Æ¡n hÃ ng
            </span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
            <div className="text-sm text-gray-500">Tá»•ng Ä‘Æ¡n</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.Pending}</div>
            <div className="text-sm text-gray-500">Chá» xá»­ lÃ½</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.Processing}</div>
            <div className="text-sm text-gray-500">Äang xá»­ lÃ½</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{statusCounts.Shipped}</div>
            <div className="text-sm text-gray-500">Äang giao</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{statusCounts.Completed}</div>
            <div className="text-sm text-gray-500">HoÃ n thÃ nh</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{statusCounts.Cancelled}</div>
            <div className="text-sm text-gray-500">ÄÃ£ há»§y</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="TÃ¬m kiáº¿m theo mÃ£ Ä‘Æ¡n hÃ ng hoáº·c tÃªn sáº£n pháº©m..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Táº¥t cáº£ tráº¡ng thÃ¡i</option>
                <option value="Pending">Chá» xá»­ lÃ½</option>
                <option value="Processing">Äang xá»­ lÃ½</option>
                <option value="Shipped">Äang giao</option>
                <option value="Completed">HoÃ n thÃ nh</option>
                <option value="Cancelled">ÄÃ£ há»§y</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PackageOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">ChÆ°a cÃ³ Ä‘Æ¡n hÃ ng nÃ o</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              {searchTerm || statusFilter !== 'all' 
                ? 'KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng phÃ¹ há»£p vá»›i bá»™ lá»c cá»§a báº¡n.'
                : 'HÃ£y báº¯t Ä‘áº§u mua sáº¯m vÃ  tráº£i nghiá»‡m dá»‹ch vá»¥ cá»§a chÃºng tÃ´i!'
              }
            </p>
            <button
              onClick={() => router.push('/shop')}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Mua sáº¯m ngay
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(order.status)}
                        <span className={`text-sm font-medium px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                          {order.status === 'Pending' && 'Chá» xá»­ lÃ½'}
                          {order.status === 'Processing' && 'Äang xá»­ lÃ½'}
                          {order.status === 'Shipped' && 'Äang giao hÃ ng'}
                          {order.status === 'Completed' && 'HoÃ n thÃ nh'}
                          {order.status === 'Cancelled' && 'ÄÃ£ há»§y'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                        #{order.orderId}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {order.totalAmount.toLocaleString()}â‚«
                      </p>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">NgÃ y Ä‘áº·t</p>
                        <p className="font-medium text-gray-900">
                          {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Sáº£n pháº©m</p>
                        <p className="font-medium text-gray-900">
                          {/* {Array.isArray(order.Items) ? order.Items.length : 0} sáº£n pháº©m */}
                          {order.items?.length || ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">PhÆ°Æ¡ng thá»©c</p>
                        <p className="font-medium text-gray-900">Giao hÃ ng tiÃªu chuáº©n</p>
                      </div>
                    </div>
                  </div>

                  {/* Products Preview */}
                  {order.items?.slice(0, 3).map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 py-3 border-t border-gray-100 first:border-t-0">
                      <img
                        src={item.product?.imageUrl || '/default-image.png'}
                        alt={item.product?.name}
                        className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm line-clamp-1">
                          {item.product?.name}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Sá»‘ lÆ°á»£ng: {item.quantity} Ã— {item.price?.toLocaleString()}â‚«
                        </p>
                      </div>
                    </div>
                  ))}

                  {order.items?.length > 3 && (
                    <div className="text-center text-sm text-gray-500 mt-3">
                      +{order.items.length - 3} sáº£n pháº©m khÃ¡c
                    </div>
                  )}

                  {/* Action */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      Cáº­p nháº­t lÃºc: {new Date(order.updatedAt || order.orderDate).toLocaleString('vi-VN')}
                    </div>
                    <Link
                      href={`/orders/${order.orderId}`}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium group"
                    >
                      Xem chi tiáº¿t
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

