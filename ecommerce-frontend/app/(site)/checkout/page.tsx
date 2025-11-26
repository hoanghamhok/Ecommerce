'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CreditCard,
  Truck,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle,
} from 'lucide-react'

// ✅ Dùng lại service có sẵn bên bạn
import { fetchCart } from '@/services/api'

type ProductLike = {
  id: number
  name: string
  price: number
  imageUrls?: string | string[]
  imageUrl?: string
  imageurl?: string
  images?: string[] | string
  thumbnail?: string
}

type CartItem = {
  cartItemId: number
  productId: number
  quantity: number
  product?: ProductLike
  name?: string
  price?: number
  imageUrls?: string
  imageUrl?: string
  imageurl?: string
  images?: string[] | string
}

// ===== Helpers =====
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5091'

function firstImageFromAny(p?: ProductLike | null): string | undefined {
  if (!p) return undefined

  const pickFromStringish = (val: any): string | undefined => {
    if (!val) return undefined
    if (typeof val === 'string') {
      // JSON array string?
      try {
        const arr = JSON.parse(val)
        if (Array.isArray(arr) && arr[0]) return String(arr[0])
      } catch {}
      // CSV?
      if (val.includes(',')) return val.split(',')[0].trim()
      return val // single url
    }
    return undefined
  }

  // Array forms
  if (Array.isArray(p.imageUrls) && p.imageUrls[0]) return p.imageUrls[0]
  if (Array.isArray(p.images) && p.images[0]) return p.images[0]

  // String-ish forms
  return (
    pickFromStringish(p.imageUrls) ||
    pickFromStringish(p.imageUrl) ||
    pickFromStringish(p.imageurl) ||
    pickFromStringish(p.thumbnail)
  )
}

function resolveImgUrl(raw?: string): string {
  if (!raw) return '/placeholder.png'
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  // Relative path from BE, vd: /uploads/xxx.png
  return `${API_BASE}${raw.startsWith('/') ? '' : '/'}${raw}`
}

function getItemName(it: CartItem): string {
  return it?.product?.name ?? it?.name ?? 'Sản phẩm'
}

function getItemPrice(it: CartItem): number {
  return Number(it?.product?.price ?? it?.price ?? 0)
}

function getItemImg(it: CartItem): string {
  // Ưu tiên lấy từ product
  const prefer = firstImageFromAny(it?.product)
  if (prefer) return resolveImgUrl(prefer)
  // Dự phòng nếu item nằm phẳng
  const flat =
    (typeof it.imageUrls === 'string' && it.imageUrls) ||
    (typeof it.imageUrl === 'string' && it.imageUrl) ||
    (typeof it.imageurl === 'string' && it.imageurl)
  if (flat) return resolveImgUrl(flat)
  return '/placeholder.png'
}

export default function CheckoutPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // ===== Cart from BE =====
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loadingCart, setLoadingCart] = useState(true)
  const [cartError, setCartError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingCart(true)
        setCartError(null)

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        if (!token) {
          setCartError('Bạn chưa đăng nhập')
          setCartItems([])
          return
        }

        const res = await fetchCart() // service của bạn: nên tự attach baseURL/token
        const data = Array.isArray(res?.data)
          ? res.data
          : (res?.data && typeof res.data === 'object' && 'items' in res.data && Array.isArray((res.data as any).items))
            ? (res.data as any).items
            : []
        // Chuẩn hoá nhẹ: đảm bảo có product nếu BE trả phẳng
        const normalized: CartItem[] = data.map((it: any) => {
          if (!it.product) {
            return {
              ...it,
              product: {
                id: it.productId ?? it.id,
                name: it.name,
                price: it.price,
                imageUrls: it.imageUrls ?? it.imageUrl ?? it.imageurl ?? it.images ?? undefined,
              },
            }
          }
          return it
        })
        setCartItems(normalized)

        // Đồng bộ nhanh cho Navbar nếu bạn dùng
        localStorage.setItem('cart', JSON.stringify(normalized))
        window.dispatchEvent(new Event('storage'))
      } catch (e: any) {
        setCartError('Không tải được giỏ hàng. Vui lòng thử lại.')
        setCartItems([])
      } finally {
        setLoadingCart(false)
      }
    }
    load()
  }, [])

  const subtotal = useMemo(
    () =>
      cartItems.reduce((sum, it) => {
        const price = getItemPrice(it)
        const qty = Number(it?.quantity ?? 0)
        return sum + price * qty
      }, 0),
    [cartItems]
  )
  const shippingFee = cartItems.length > 0 ? 0 : 0
  const total = subtotal + shippingFee

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

  // ===== Form =====
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: '',

    paymentMethod: 'cod', // 'cod' | 'banking' | 'card' | 'momo'
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCVV: '',
  })
  const onChange = (k: keyof typeof formData, v: string) => setFormData((s) => ({ ...s, [k]: v }))

  // ===== Submit =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 1) {
      if (!formData.fullName || !formData.phone || !formData.address) {
        alert('Vui lòng điền đầy đủ Họ tên, SĐT, Địa chỉ')
        return
      }
      setStep(2)
      return
    }

    if (step === 2) {
      if (formData.paymentMethod === 'card') {
        if (!formData.cardNumber || !formData.cardName || !formData.cardExpiry || !formData.cardCVV) {
          alert('Vui lòng điền đầy đủ thông tin thẻ')
          return
        }
      }
      setStep(3)
      return
    }

    // Step 3: Gọi BE tạo đơn
    try {
      if (cartItems.length === 0) {
        alert('Giỏ hàng trống. Vui lòng quay lại giỏ hàng.')
        router.push('/carts')
        return
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        alert('Bạn chưa đăng nhập')
        return
      }

      const payload = {
        shippingInfo: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          ward: formData.ward,
          note: formData.note,
        },
        paymentMethod: formData.paymentMethod,
        items: cartItems.map((it) => ({
          productId: it.productId ?? it?.product?.id,
          quantity: it.quantity,
          price: getItemPrice(it),
        })),
        subtotal,
        shippingFee,
        total,
      }

      // COD
      if (formData.paymentMethod === 'cod') {
        const res = await fetch(`${API_BASE}/api/Cart/checkout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload), // payload chứa shippingInfo + items + total...
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || 'Lỗi khi thanh toán COD');

        // 🔑 Lưu shipping info theo orderId để trang /orders/[id] đọc và hiển thị ngay
        try {
          if (data?.orderId) {
            localStorage.setItem(
              `order:shipping:${data.orderId}`,
              JSON.stringify(payload.shippingInfo)
            );
          }
        } catch {}

        // 🧹 Clear giỏ + thông báo
        localStorage.setItem('cart', JSON.stringify([]));
        window.dispatchEvent(new Event('storage'));
        alert('Đặt hàng thành công! Cảm ơn bạn đã mua hàng.');

        // ✅ Điều hướng đúng: /orders/{orderId}
        if (data?.orderId) {
          router.push(`/orders/${data.orderId}`);
        } else {
          // fallback nếu BE chưa trả orderId (tạm quay về list)
          router.push('/orders');
        }
        return;
      }

      // MoMo (nếu dùng server thanh toán riêng)
      if (formData.paymentMethod === 'momo') {
        const res = await fetch(`${API_BASE}/api/cart/checkout-momo`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ items: payload.items, total }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Lỗi tạo thanh toán MoMo')

        if (data?.url) {
          window.location.href = data.url
          return
        } else {
          alert('Thiếu url thanh toán MoMo từ server')
        }
        return
      }

      // Banking/Card — ví dụ tạo intent rồi redirect
      if (formData.paymentMethod === 'banking' || formData.paymentMethod === 'card') {
        const res = await fetch(`${API_BASE}/api/Cart/checkout-intent`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || 'Lỗi tạo giao dịch')

        if (data?.url) {
          window.location.href = data.url
          return
        }
        alert('Đã tạo đơn. Vui lòng thực hiện thanh toán theo hướng dẫn.')
        router.push('/orders')
        return
      }
    } catch (err: any) {
      alert(err?.message || 'Có lỗi xảy ra khi đặt hàng')
    }
  }

  // ===== UI =====
  if (loadingCart) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg">
        Đang tải giỏ hàng...
      </div>
    )
  }

  if (cartError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-red-600 text-lg">{cartError}</p>
        <Link href="/carts" className="text-blue-600 hover:underline">Quay lại giỏ hàng</Link>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-3">Giỏ hàng của bạn đang trống</h1>
          <p className="text-gray-600 mb-6">Vui lòng thêm sản phẩm rồi quay lại trang thanh toán.</p>
          <Link
            href="/carts"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft size={18} /> Quay lại giỏ hàng
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span>/</span>
          <Link href="/carts" className="hover:text-blue-600">Giỏ hàng</Link>
          <span>/</span>
          <span className="text-gray-900">Thanh toán</span>
        </div>

        {/* Back Button */}
        <Link
          href="/carts"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} />
          Quay lại giỏ hàng
        </Link>

        {/* Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[
              { num: 1 as const, title: 'Thông tin giao hàng', icon: Truck },
              { num: 2 as const, title: 'Thanh toán', icon: CreditCard },
              { num: 3 as const, title: 'Xác nhận', icon: CheckCircle },
            ].map((s, idx) => {
              const Icon = s.icon
              return (
                <div key={s.num} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <Icon size={24} />
                    </div>
                    <span className={`mt-2 text-sm font-medium ${
                      step >= s.num ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {s.title}
                    </span>
                  </div>
                  {idx < 2 && <div className={`w-24 h-1 mx-4 ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Step 1 */}
              {step === 1 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-6">Thông tin giao hàng</h2>

                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 text-gray-400" size={20} />
                          <input
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={(e) => onChange('fullName', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nguyễn Văn A"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => onChange('phone', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0901234567"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => onChange('email', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="example@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Địa chỉ <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={(e) => onChange('address', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Số nhà, tên đường"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Thành phố</label>
                        <select
                          value={formData.city}
                          onChange={(e) => onChange('city', e.target.value)}
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Chọn thành phố</option>
                          <option value="Hà Nội">Hà Nội</option>
                          <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                          <option value="Đà Nẵng">Đà Nẵng</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Quận/Huyện</label>
                        <input
                          type="text"
                          value={formData.district}
                          onChange={(e) => onChange('district', e.target.value)}
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Quận/Huyện"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Phường/Xã</label>
                        <input
                          type="text"
                          value={formData.ward}
                          onChange={(e) => onChange('ward', e.target.value)}
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Phường/Xã"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Ghi chú</label>
                      <textarea
                        value={formData.note}
                        onChange={(e) => onChange('note', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ghi chú cho người giao hàng..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Tiếp tục
                  </button>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-6">Phương thức thanh toán</h2>

                  <div className="space-y-4">
                    {/* COD */}
                    <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={(e) => onChange('paymentMethod', e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Truck size={20} className="text-blue-600" />
                          <span className="font-semibold">Thanh toán khi nhận hàng (COD)</span>
                        </div>
                        <p className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</p>
                      </div>
                    </label>

                    {/* Banking */}
                    <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="banking"
                        checked={formData.paymentMethod === 'banking'}
                        onChange={(e) => onChange('paymentMethod', e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard size={20} className="text-blue-600" />
                          <span className="font-semibold">Chuyển khoản ngân hàng</span>
                        </div>
                        <p className="text-sm text-gray-600">Chuyển khoản qua Internet Banking</p>
                      </div>
                    </label>

                    {/* Card */}
                    <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={(e) => onChange('paymentMethod', e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard size={20} className="text-blue-600" />
                          <span className="font-semibold">Thẻ tín dụng/Ghi nợ</span>
                        </div>
                        <p className="text-sm text-gray-600">Visa, Mastercard, JCB</p>
                      </div>
                    </label>

                    {/* MoMo (tuỳ bật) */}
                    <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="momo"
                        checked={formData.paymentMethod === 'momo'}
                        onChange={(e) => onChange('paymentMethod', e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard size={20} className="text-blue-600" />
                          <span className="font-semibold">Ví MoMo / Quét QR</span>
                        </div>
                        <p className="text-sm text-gray-600">Thanh toán qua cổng MoMo</p>
                      </div>
                    </label>

                    {/* Card details */}
                    {formData.paymentMethod === 'card' && (
                      <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Số thẻ</label>
                          <input
                            type="text"
                            value={formData.cardNumber}
                            onChange={(e) => onChange('cardNumber', e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg"
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Tên trên thẻ</label>
                          <input
                            type="text"
                            value={formData.cardName}
                            onChange={(e) => onChange('cardName', e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg"
                            placeholder="NGUYEN VAN A"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Ngày hết hạn</label>
                            <input
                              type="text"
                              value={formData.cardExpiry}
                              onChange={(e) => onChange('cardExpiry', e.target.value)}
                              className="w-full px-4 py-3 border rounded-lg"
                              placeholder="MM/YY"
                              maxLength={5}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">CVV</label>
                            <input
                              type="text"
                              value={formData.cardCVV}
                              onChange={(e) => onChange('cardCVV', e.target.value)}
                              className="w-full px-4 py-3 border rounded-lg"
                              placeholder="123"
                              maxLength={3}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Tiếp tục
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-6">Xác nhận đơn hàng</h2>

                  {/* Shipping */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Truck size={20} className="text-blue-600" />
                      Thông tin giao hàng
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Người nhận:</span> {formData.fullName}</p>
                      <p><span className="font-medium">SĐT:</span> {formData.phone}</p>
                      {formData.email && <p><span className="font-medium">Email:</span> {formData.email}</p>}
                      <p>
                        <span className="font-medium">Địa chỉ:</span> {formData.address}
                        {formData.ward ? `, ${formData.ward}` : ''}
                        {formData.district ? `, ${formData.district}` : ''}
                        {formData.city ? `, ${formData.city}` : ''}
                      </p>
                      {formData.note && <p><span className="font-medium">Ghi chú:</span> {formData.note}</p>}
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CreditCard size={20} className="text-blue-600" />
                      Phương thức thanh toán
                    </h3>
                    <p className="text-sm">
                      {formData.paymentMethod === 'cod' && 'Thanh toán khi nhận hàng (COD)'}
                      {formData.paymentMethod === 'banking' && 'Chuyển khoản ngân hàng'}
                      {formData.paymentMethod === 'card' && 'Thẻ tín dụng/Ghi nợ'}
                      {formData.paymentMethod === 'momo' && 'Ví MoMo / Quét QR'}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Đặt hàng
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-4">Đơn hàng của bạn</h3>

              <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => {
                  const imgSrc = getItemImg(item)
                  const name = getItemName(item)
                  const price = getItemPrice(item)
                  return (
                    <div key={item.cartItemId ?? item.productId} className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={imgSrc}
                          alt={name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/placeholder.png'
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2">{name}</h4>
                        <p className="text-sm text-gray-600">x{item.quantity}</p>
                        <p className="font-semibold text-blue-600">{formatPrice(price)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold">{formatPrice(shippingFee)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-lg font-semibold">Tổng cộng</span>
                  <span className="text-2xl font-bold text-blue-600">{formatPrice(total)}</span>
                </div>
              </div>

              {step === 3 ? null : (
                <button
                  onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
                  className="w-full mt-5 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  {step === 1 ? 'Tiếp tục thanh toán' : 'Tới xác nhận'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
