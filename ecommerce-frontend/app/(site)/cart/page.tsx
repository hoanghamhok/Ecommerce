'use client';
import { useEffect, useState } from "react";   
import { fetchCart, updateCartItem } from "../services/api";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft, 
  CreditCard,
  ShoppingBag,
  Heart,
  Star,
  Truck,
  Shield,
  Gift,
  CheckCircle,X
} from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [removingItems, setRemovingItems] = useState<Set<number>>(new Set());
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [showSuccess, setShowSuccess] = useState<{ visible: boolean; orderId?: string }>({ visible: false });
    const [paymentMethod, setPaymentMethod] = useState("cod");

    // Hàm lấy danh sách sản phẩm trong giỏ hàng
    useEffect(() => {
        const loadCart = async () => {
            try {
                setLoading(true);
                const res = await fetchCart();
                const data = res.data as any[];
                setCartItems(data);
                calculateTotal(data);
            } catch (err) {
                setError("Lỗi khi tải giỏ hàng. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };
        
        loadCart();
    }, []);

    const calculateTotal = (items: any[]) => {
        const subtotal = items.reduce((sum: number, item: any) => {
            return sum + (item.product.price * item.quantity);
        }, 0);
        setTotal(subtotal - discount);
    };

    const handleUpdateQuantity = async (itemId: number, productId: number, quantity: number) => {
        try {
            if (quantity < 1) {
                handleRemoveItem(itemId, productId);
                return;
            }
            
            await updateCartItem(productId, quantity);
            setCartItems((prevItems) => 
                prevItems.map((item) => 
                    item.productId === productId ? {...item, quantity} : item
                )
            );
            
            const updatedItems = cartItems.map((item) => 
                item.productId === productId ? {...item, quantity} : item
            );
            calculateTotal(updatedItems);
        } catch (err) {
            console.error("Lỗi khi cập nhật số lượng:", err);
        }
    };

    const handleRemoveItem = async (itemId: number, productId: number) => {
        setRemovingItems(prev => new Set(prev).add(itemId));
        
        try {
            // Simulate API call for removing item
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setCartItems(prevItems => {
                const updatedItems = prevItems.filter(item => item.id !== itemId);
                calculateTotal(updatedItems);
                return updatedItems;
            });
        } catch (err) {
            console.error("Lỗi khi xóa sản phẩm:", err);
        } finally {
            setRemovingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        }
    };

    const handleApplyPromo = () => {
        if (promoCode.toLowerCase() === 'gocart10') {
            setDiscount(total * 0.1);
            calculateTotal(cartItems);
        }
    };

    const handleCheckout = async () => {
        setIsCheckingOut(true);

        try {
            const token = localStorage.getItem("token");

            if (paymentMethod === "momo") {
            const response = await fetch("https://localhost:5091/api/cart/checkout-momo", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ items: cartItems, total })
            });

            if (!response.ok) {
                throw new Error("Thanh toán MoMo thất bại");
            }

            const data = await response.json();

            // Nếu server trả về url từ MoMo
            if (data.url) {
                window.location.href = data.url;
                return;
            }

            setShowSuccess({ visible: true, orderId: data.orderId });
            }

            else if (paymentMethod === "cod") {
            const res = await fetch("http://localhost:5091/api/Cart/checkout", {
                method: "POST",
                headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
                }
            });

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text();
                console.error("Unexpected response (not JSON):", text);
                throw new Error("Server trả về định dạng không hợp lệ.");
            }

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Lỗi không xác định");
            }

            setShowSuccess({ visible: true, orderId: data.orderId });
            setCartItems([]);
            setTotal(0);
            setTimeout(() => setShowSuccess({ visible: false }), 5000);
            }

            else {
            alert("Vui lòng chọn phương thức thanh toán");
            }
        } catch (error: any) {
            console.error("Checkout Error:", error);
            alert("Lỗi khi thanh toán: " + error.message);
        } finally {
            setIsCheckingOut(false);
        }
        };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="animate-pulse">
                        <div className="h-8 bg-slate-300 rounded-lg w-64 mb-8"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-24 h-24 bg-slate-300 rounded-xl"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-slate-300 rounded mb-2"></div>
                                                <div className="h-4 bg-slate-300 rounded w-2/3"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="h-64 bg-slate-300 rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center p-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Có lỗi xảy ra</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors duration-200"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href="/shop"
                            className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 transition-colors duration-200"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Tiếp tục mua sắm</span>
                        </Link>
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Giỏ hàng của bạn</h1>
                        <p className="text-slate-600 mt-1">{cartItems.length} sản phẩm</p>
                    </div>
                {showSuccess.visible && (
                    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
                        <div className="flex items-center bg-white border border-emerald-200 shadow-xl rounded-2xl px-6 py-4 space-x-3 animate-fade-in">
                        <CheckCircle className="w-7 h-7 text-emerald-500" />
                        <div>
                            <div className="font-bold text-emerald-700 text-lg">Thanh toán thành công!</div>
                            <div className="text-slate-600 text-sm">
                            Mã đơn hàng: <span className="font-semibold">{showSuccess.orderId}</span>
                            </div>
                        </div>
                        <button
                            className="ml-4 p-1 rounded hover:bg-slate-100"
                            onClick={() => setShowSuccess({ visible: false })}
                            aria-label="Đóng"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                        </div>
                        <style jsx>{`
                        .animate-fade-in {
                            animation: fadeInScale 0.4s cubic-bezier(.4,0,.2,1);
                        }
                        @keyframes fadeInScale {
                            from { opacity: 0; transform: scale(0.95) translateY(-10px);}
                            to { opacity: 1; transform: scale(1) translateY(0);}
                        }
                        `}</style>
                    </div>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    /* Empty Cart State */
                    <div className="text-center py-16">
                        <div className="w-32 h-32 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-16 h-16 text-slate-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Giỏ hàng trống</h2>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto">
                            Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!
                        </p>
                        <Link
                            href="/shop"
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span>Bắt đầu mua sắm</span>
                        </Link>
                    </div>
                ) : (
                    /* Cart Content */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item, index) => (
                                <div 
                                    key={item.product.id}
                                    className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 ${
                                        removingItems.has(item.id) ? 'opacity-50 scale-95' : 'hover:shadow-md'
                                    }`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="p-6">
                                        <div className="flex items-start space-x-4">
                                            {/* Product Image */}
                                            <div className="relative">
                                                <img
                                                    src={item.product.imageUrl || '/default-image.png'}
                                                    alt={item.product.name}
                                                    className="w-24 h-24 object-cover rounded-xl"
                                                />
                                                <button
                                                    onClick={() => handleRemoveItem(item.id, item.productId)}
                                                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-lg"
                                                    disabled={removingItems.has(item.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                                                        {item.product.name}
                                                    </h3>
                                                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200">
                                                        <Heart className="w-5 h-5 text-slate-400 hover:text-red-500" />
                                                    </button>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <div className="flex items-center space-x-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                                        ))}
                                                    </div>
                                                    <span className="text-sm text-slate-500">(4.8)</span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center space-x-2 bg-slate-100 rounded-xl p-1">
                                                            <button
                                                                onClick={() => handleUpdateQuantity(item.id, item.productId, item.quantity - 1)}
                                                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors duration-200"
                                                                disabled={removingItems.has(item.id)}
                                                            >
                                                                <Minus className="w-4 h-4 text-slate-600" />
                                                            </button>
                                                            <span className="w-12 text-center font-semibold text-slate-900">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => handleUpdateQuantity(item.id, item.productId, item.quantity + 1)}
                                                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors duration-200"
                                                                disabled={removingItems.has(item.id)}
                                                            >
                                                                <Plus className="w-4 h-4 text-slate-600" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-emerald-600">
                                                            {(item.product.price * item.quantity).toLocaleString()}₫
                                                        </p>
                                                        <p className="text-sm text-slate-500">
                                                            {item.product.price.toLocaleString()}₫ / sản phẩm
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="space-y-6">
                            {/* Promo Code */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Mã giảm giá</h3>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        placeholder="Nhập mã giảm giá"
                                        className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleApplyPromo}
                                        className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors duration-200 font-semibold"
                                    >
                                        Áp dụng
                                    </button>
                                </div>
                                {discount > 0 && (
                                    <div className="mt-3 flex items-center space-x-2 text-green-600">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm">Giảm giá {discount.toLocaleString()}₫</span>
                                    </div>
                                )}
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                {/* Payment Method */}
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Phương thức thanh toán</h3>
                            <div className="space-y-3">
                                <label className="flex items-center space-x-3">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cod"
                                    checked={paymentMethod === "cod"}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="form-radio h-5 w-5 text-emerald-600"
                                />
                                <span className="text-slate-700">Thanh toán khi nhận hàng (COD)</span>
                                </label>

                                <label className="flex items-center space-x-3">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="momo"
                                    checked={paymentMethod === "momo"}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="form-radio h-5 w-5 text-emerald-600"
                                />
                                <span className="text-slate-700">Thanh toán qua Ví MoMo</span>
                                </label>
                            </div>
                            </div>


                            {/* Order Summary */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Tóm tắt đơn hàng</h3>
                                
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Tạm tính</span>
                                        <span className="font-semibold">{(total + discount).toLocaleString()}₫</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Giảm giá</span>
                                            <span>-{discount.toLocaleString()}₫</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Phí vận chuyển</span>
                                        <span className="font-semibold text-green-600">Miễn phí</span>
                                    </div>
                                    <div className="border-t border-slate-200 pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-slate-900">Tổng cộng</span>
                                            <span className="text-2xl font-bold text-emerald-600">
                                                {total.toLocaleString()}₫
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isCheckingOut ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Đang xử lý...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center space-x-2">
                                            <CreditCard className="w-5 h-5" />
                                            <span>Thanh toán ngay</span>
                                        </div>
                                    )}
                                </button>
                            </div>

                            {/* Features */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Cam kết của chúng tôi</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                            <Truck className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Giao hàng miễn phí</p>
                                            <p className="text-sm text-slate-600">Cho đơn hàng từ 500K</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Bảo hành chính hãng</p>
                                            <p className="text-sm text-slate-600">12 tháng bảo hành</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                            <Gift className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Đổi trả dễ dàng</p>
                                            <p className="text-sm text-slate-600">Trong vòng 30 ngày</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
