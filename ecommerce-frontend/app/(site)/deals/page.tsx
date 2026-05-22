'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5091';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';

type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  discount?: number;
};

export default function DealsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        const data: Product[] = await res.json();
        const discounted = data.filter(p => p.discount && p.discount > 0);
        setProducts(discounted);
      } catch (error) {
        console.error('Lá»—i khi táº£i sáº£n pháº©m giáº£m giÃ¡:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-red-100 text-red-600 px-6 py-2 rounded-full mb-4">
            <Zap className="w-5 h-5 mr-2 animate-pulse" />
            <span className="font-semibold">FLASH SALE</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3">
            <span className="text-red-600">Æ¯u Ä‘Ã£i hot hÃ´m nay</span>
          </h1>
          <p className="text-lg text-slate-600">SÄƒn deal cá»±c sá»‘c - Sá»‘ lÆ°á»£ng cÃ³ háº¡n!</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-32 h-32 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <Zap className="w-16 h-16 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Hiá»‡n chÆ°a cÃ³ Æ°u Ä‘Ã£i</h2>
            <p className="text-slate-600 mb-6">HÃ£y quay láº¡i sau Ä‘á»ƒ khÃ¡m phÃ¡ cÃ¡c deal hot!</p>
            <Link
              href="/shop"
              className="inline-flex items-center bg-gradient-to-r from-red-500 to-orange-400 text-white px-8 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-orange-500 transition-all duration-200"
            >
              Xem táº¥t cáº£ sáº£n pháº©m
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map(product => {
              const priceAfterDiscount = Math.round(
                product.price * (1 - (product.discount || 0) / 100)
              );
              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-red-100 relative overflow-hidden flex flex-col"
                >
                  {/* Discount Ribbon */}
                  <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-2 rotate-45 translate-x-8 -translate-y-2 text-xs font-bold shadow-lg z-10">
                    -{product.discount}%
                  </div>

                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={product.imageUrl || '/default-image.png'}
                      alt={product.name}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => (e.currentTarget.src = '/default-image.png')}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col p-5">
                    <h2 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {product.name}
                    </h2>
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="text-2xl font-black text-red-600">
                        {priceAfterDiscount.toLocaleString()}â‚«
                      </span>
                      <span className="line-through text-slate-400">
                        {product.price.toLocaleString()}â‚«
                      </span>
                    </div>
                    <div className="mt-auto space-y-2">
                      <Link
                        href={`/shop/product/${product.id}`}
                        className="inline-flex items-center justify-center w-full bg-gradient-to-r from-red-500 to-orange-400 text-white py-2 rounded-xl font-semibold hover:from-red-600 hover:to-orange-500 hover:scale-105 transition-all duration-200 group"
                      >
                        Xem chi tiáº¿t
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <AddToCartButton productId={product.id} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

