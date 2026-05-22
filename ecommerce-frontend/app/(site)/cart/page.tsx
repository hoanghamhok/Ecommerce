'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5091';
import { useEffect, useState } from "react";   
import { fetchCart, updateCartItem,removeCartItem } from "../../../services/api";
import { useRouter } from 'next/navigation';
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
    const router = useRouter();
    const goCheckout = () => {
    router.push('/checkout');
    }
    // HÃ m láº¥y danh sÃ¡ch sáº£n pháº©m trong giá» hÃ ng
    useEffect(() => {
        const loadCart = async () => {
            try {
                setLoading(true);
                const res = await fetchCart();
                const data = res.data as any[];
                setCartItems(data);
                calculateTotal(data);
            } catch (err) {
                setError("Lá»—i khi táº£i giá» hÃ ng. Vui lÃ²ng thá»­ láº¡i sau.");
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
            console.error("Lá»—i khi cáº­p nháº­t sá»‘ lÆ°á»£ng:", err);
        }
    };

    const handleRemoveItem = async (itemId: number, productId: number) => {
        setRemovingItems(prev => new Set(prev).add(itemId));
        
        try {
            await removeCartItem(productId);      
            setCartItems(prevItems => {
                const updatedItems = prevItems.filter(item => item.cartItemId !== itemId);
                calculateTotal(updatedItems);
                return updatedItems;
            });
        } catch (err) {
            console.error("Lá»—i khi xÃ³a sáº£n pháº©m:", err);
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
            const response = await fetch(`${API_BASE}/api/cart/checkout-momo`, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ items: cartItems, total })
            });

            if (!response.ok) {
                throw new Error("Thanh toÃ¡n MoMo tháº¥t báº¡i");
            }

            const data = await response.json();

            // Náº¿u server tráº£ vá» url tá»« MoMo
            if (data.url) {
                window.location.href = data.url;
                return;
            }

            setShowSuccess({ visible: true, orderId: data.orderId });
            }

            else if (paymentMethod === "cod") {
            const res = await fetch(`${API_BASE}/api/Cart/checkout`, {
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
                throw new Error("Server tráº£ vá» Ä‘á»‹nh dáº¡ng khÃ´ng há»£p lá»‡.");
            }

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Lá»—i khÃ´ng xÃ¡c Ä‘á»‹nh");
            }

            setShowSuccess({ visible: true, orderId: data.orderId });
            setCartItems([]);
            setTotal(0);
            setTimeout(() => setShowSuccess({ visible: false }), 5000);
            }

            else {
            alert("Vui lÃ²ng chá»n phÆ°Æ¡ng thá»©c thanh toÃ¡n");
            }
        } catch (error: any) {
            console.error("Checkout Error:", error);
            alert("Lá»—i khi thanh toÃ¡n: " + error.message);
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
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">CÃ³ lá»—i xáº£y ra</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors duration-200"
                    >
                        Thá»­ láº¡i
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
                            <span>Tiáº¿p tá»¥c mua sáº¯m</span>
                        </Link>
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Giá» hÃ ng cá»§a báº¡n</h1>
                        <p className="text-slate-600 mt-1">{cartItems.length} sáº£n pháº©m</p>
                    </div>
                {showSuccess.visible && (
                    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
                        <div className="flex items-center bg-white border border-emerald-200 shadow-xl rounded-2xl px-6 py-4 space-x-3 animate-fade-in">
                        <CheckCircle className="w-7 h-7 text-emerald-500" />
                        <div>
                            <div className="font-bold text-emerald-700 text-lg">Thanh toÃ¡n thÃ nh cÃ´ng!</div>
                            <div className="text-slate-600 text-sm">
                            MÃ£ Ä‘Æ¡n hÃ ng: <span className="font-semibold">{showSuccess.orderId}</span>
                            </div>
                        </div>
                        <button
                            className="ml-4 p-1 rounded hover:bg-slate-100"
                            onClick={() => setShowSuccess({ visible: false })}
                            aria-label="ÄÃ³ng"
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
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Giá» hÃ ng trá»‘ng</h2>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto">
                            Báº¡n chÆ°a cÃ³ sáº£n pháº©m nÃ o trong giá» hÃ ng. HÃ£y khÃ¡m phÃ¡ cÃ¡c sáº£n pháº©m tuyá»‡t vá»i cá»§a chÃºng tÃ´i!
                        </p>
                        <Link
                            href="/shop"
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span>Báº¯t Ä‘áº§u mua sáº¯m</span>
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
                                        removingItems.has(item.cartItemId) ? 'opacity-50 scale-95' : 'hover:shadow-md'
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
                                                    onClick={() => handleRemoveItem(item.cartItemId, item.productId)}
                                                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-lg"
                                                    disabled={removingItems.has(item.cartItemId)}
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
                                                                onClick={() => handleUpdateQuantity(item.cartItemId, item.productId, item.quantity - 1)}
                                                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors duration-200"
                                                                disabled={removingItems.has(item.cartItemId)}
                                                            >
                                                                <Minus className="w-4 h-4 text-slate-600" />
                                                            </button>
                                                            <span className="w-12 text-center font-semibold text-slate-900">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => handleUpdateQuantity(item.cartItemId, item.productId, item.quantity + 1)}
                                                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors duration-200"
                                                                disabled={removingItems.has(item.cartItemId)}
                                                            >
                                                                <Plus className="w-4 h-4 text-slate-600" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-emerald-600">
                                                            {(item.product.price * item.quantity).toLocaleString()}â‚«
                                                        </p>
                                                        <p className="text-sm text-slate-500">
                                                            {item.product.price.toLocaleString()}â‚« / sáº£n pháº©m
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
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">MÃ£ giáº£m giÃ¡</h3>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        placeholder="Nháº­p mÃ£ giáº£m giÃ¡"
                                        className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleApplyPromo}
                                        className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors duration-200 font-semibold"
                                    >
                                        Ãp dá»¥ng
                                    </button>
                                </div>
                                {discount > 0 && (
                                    <div className="mt-3 flex items-center space-x-2 text-green-600">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm">Giáº£m giÃ¡ {discount.toLocaleString()}â‚«</span>
                                    </div>
                                )}
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                {/* Payment Method */}
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">PhÆ°Æ¡ng thá»©c thanh toÃ¡n</h3>
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
                                <span className="text-slate-700">Thanh toÃ¡n khi nháº­n hÃ ng (COD)</span>
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
                                <span className="text-slate-700">Thanh toÃ¡n qua VÃ­ MoMo</span>
                                </label>
                            </div>
                            </div>


                            {/* Order Summary */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">TÃ³m táº¯t Ä‘Æ¡n hÃ ng</h3>
                                
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Táº¡m tÃ­nh</span>
                                        <span className="font-semibold">{(total + discount).toLocaleString()}â‚«</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Giáº£m giÃ¡</span>
                                            <span>-{discount.toLocaleString()}â‚«</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">PhÃ­ váº­n chuyá»ƒn</span>
                                        <span className="font-semibold text-green-600">Miá»…n phÃ­</span>
                                    </div>
                                    <div className="border-t border-slate-200 pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-slate-900">Tá»•ng cá»™ng</span>
                                            <span className="text-2xl font-bold text-emerald-600">
                                                {total.toLocaleString()}â‚«
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={goCheckout}
                                    disabled={isCheckingOut}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isCheckingOut ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Äang xá»­ lÃ½...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center space-x-2">
                                            <CreditCard className="w-5 h-5" />
                                            <span>Thanh toÃ¡n ngay</span>
                                        </div>
                                    )}
                                </button>
                            </div>

                            {/* Features */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Cam káº¿t cá»§a chÃºng tÃ´i</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                            <Truck className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Giao hÃ ng miá»…n phÃ­</p>
                                            <p className="text-sm text-slate-600">Cho Ä‘Æ¡n hÃ ng tá»« 500K</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Báº£o hÃ nh chÃ­nh hÃ£ng</p>
                                            <p className="text-sm text-slate-600">12 thÃ¡ng báº£o hÃ nh</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                            <Gift className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Äá»•i tráº£ dá»… dÃ ng</p>
                                            <p className="text-sm text-slate-600">Trong vÃ²ng 30 ngÃ y</p>
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

