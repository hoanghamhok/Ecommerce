"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

// Bạn có thể mở rộng theo dữ liệu thực tế của bạn
export type Product = {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  imageUrls?: string[];
  discount?: number; // % giảm giá, ví dụ 15 -> 15%
  rating?: number; // 0..5
  ratingCount?: number;
  isNew?: boolean;
};

type Props = {
  products: Product[];
  loading?: boolean;
  onAddToCart: (id: number) => Promise<void>;
};

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function ProductsGrid({ products, loading, onAddToCart }: Props) {
  const showSkeleton = loading || products.length === 0;

  return (
    <section id="products" className="relative bg-gradient-to-b from-white to-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="inline-block rounded-full border px-3 py-1 text-xs font-medium text-gray-600 tracking-wide bg-white/60 backdrop-blur">
            Bộ sưu tập tuần này
          </p>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Sản phẩm nổi bật
          </h2>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            Chọn ngay những món hot nhất với giá tốt và ưu đãi hấp dẫn.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-7 md:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {showSkeleton
            ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p.id} p={p} onAddToCart={onAddToCart} />)}
        </div>
      </div>

      {/* Đường trang trí */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-12 h-24 bg-gradient-to-t from-gray-100 to-transparent" />
    </section>
  );
}

function ProductCard({ p, onAddToCart }: { p: Product; onAddToCart: (id: number) => Promise<void> }) {
  const priceText = useMemo(() => currency.format(p.price), [p.price]);
  const hasDiscount = typeof p.discount === "number" && p.discount! > 0;
  const finalPrice = hasDiscount ? p.price * (1 - (p.discount! / 100)) : p.price;

  return (
    <div className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Badges */}
      {(p.isNew || hasDiscount) && (
        <div className="absolute left-3 top-3 z-10 flex gap-2">
          {p.isNew && <span className="rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1">Mới</span>}
          {hasDiscount && (
            <span className="rounded-full bg-rose-50 text-rose-700 text-xs font-semibold px-2.5 py-1">
              -{p.discount}%
            </span>
          )}
        </div>
      )}

      {/* Ảnh */}
      <Link href={`/shop/product/${p.id}`} className="block relative aspect-[4/3] bg-gray-50">
        <Image
          src={p.imageUrls?.[0] || "/placeholder.jpg"}
          alt={p.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          priority={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_50%,rgba(0,0,0,0.04)_100%)] opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {/* Nội dung */}
      <div className="p-4 flex flex-col gap-3">
        <Link href={`/shop/product/${p.id}`} className="line-clamp-1 font-semibold tracking-tight text-gray-900 hover:text-blue-600">
          {p.name}
        </Link>
        {p.description && (
          <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">{p.description}</p>
        )}

        {/* Giá */}
        <div className="mt-1 flex items-baseline gap-2">
          <div className="text-2xl font-extrabold text-blue-700">{currency.format(finalPrice)}</div>
          {hasDiscount && <div className="text-sm text-gray-400 line-through">{priceText}</div>}
        </div>

        {/* Actions */}
        <div className="mt-1 grid grid-cols-2 gap-2">
          <Link
            href={`/shop/product/${p.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition"
            aria-label={`Xem chi tiết ${p.name}`}
          >
            <EyeIcon className="h-4 w-4" />
            <span>Xem chi tiết</span>
          </Link>
          <button
            onClick={() => void onAddToCart(Number(p.id))}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 text-white font-semibold py-2.5 hover:bg-yellow-600 active:scale-[.99] transition"
            aria-label={`Thêm ${p.name} vào giỏ hàng`}
          >
            <CartIcon className="h-4 w-4" />
            <span>Thêm vào giỏ</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="aspect-[4/3] animate-pulse bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-gray-100 animate-pulse rounded" />
        <div className="h-3 w-full bg-gray-100 animate-pulse rounded" />
        <div className="h-3 w-5/6 bg-gray-100 animate-pulse rounded" />
        <div className="h-6 w-1/3 bg-gray-100 animate-pulse rounded" />
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="h-10 bg-gray-100 animate-pulse rounded-xl" />
          <div className="h-10 bg-gray-100 animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function Stars({ value = 0 }: { value?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="inline-flex items-center">
      {Array.from({ length: full }).map((_, i) => (
        <StarFull key={`f-${i}`} className="h-4 w-4 text-amber-400" />
      ))}
      {half && <StarHalf className="h-4 w-4 text-amber-400" />}
      {Array.from({ length: empty }).map((_, i) => (
        <StarEmpty key={`e-${i}`} className="h-4 w-4 text-amber-400" />
      ))}
    </div>
  );
}

// ===== Svg Icons (không cần cài thêm lib) =====
function CartIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
      <path d="M3 4h2l2.4 12.2A2 2 0 0 0 9.37 18H18a2 2 0 0 0 1.96-1.6l1.6-8H6" />
    </svg>
  );
}

function EyeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function StarFull({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <path fill="url(#g)" stroke="currentColor" strokeWidth="0.4" d="m12 2 2.9 6 6.6.9-4.8 4.7 1.2 6.6L12 17.8 6.1 20.2l1.2-6.6L2.5 8.9l6.6-.9L12 2Z" />
    </svg>
  );
}

function StarHalf({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="h" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <path fill="#E5E7EB" stroke="currentColor" strokeWidth="0.4" d="m12 2 2.9 6 6.6.9-4.8 4.7 1.2 6.6L12 17.8V2Z" />
      <path fill="url(#h)" stroke="currentColor" strokeWidth="0.4" d="m12 2-2.9 6-6.6.9 4.8 4.7-1.2 6.6L12 17.8V2Z" />
    </svg>
  );
}

function StarEmpty({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className={className}>
      <path d="m12 2 2.9 6 6.6.9-4.8 4.7 1.2 6.6L12 17.8 6.1 20.2l1.2-6.6L2.5 8.9l6.6-.9L12 2Z" />
    </svg>
  );
}
