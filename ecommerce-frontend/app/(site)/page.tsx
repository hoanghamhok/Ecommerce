'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { addToCart, fetchProducts } from './services/api';
import PromoBanner from '@/components/PromoBanner';
import BrandSlider from '@/components/BrandSlider';
import BlogPreview from '@/components/BlogPreview';
import FAQSection from '@/components/FAQ';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
  fetchProducts().then((res) => {
    setProducts(res.data as any[]);
  });
}, []);

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart({ productId, quantity: 1 });
      alert('Đã thêm sản phẩm vào giỏ.');
    } catch {
      alert('Lỗi khi thêm sản phẩm vào giỏ.');
    }
  };

  return (
    <div>
      <PromoBanner/>
      {/* Highlights */}
      <section className="max-w-7xl mx-auto my-16 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Đa dạng sản phẩm', color: 'text-blue-500', icon: '📦', desc: 'Nhiều loại hàng hóa đa ngành, giá cạnh tranh.' },
          { title: 'Giao hàng nhanh', color: 'text-green-500', icon: '🚚', desc: 'Nhanh chóng - An toàn - Đúng hẹn toàn quốc.' },
          { title: 'Đổi trả dễ dàng', color: 'text-yellow-500', icon: '🔄', desc: '7 ngày đổi trả miễn phí không cần lý do.' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all flex flex-col items-center text-center">
            <div className={`text-4xl mb-3 ${item.color}`}>{item.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-500 text-sm">{item.desc}</p>
          </div>
        ))}
      </section>
      <BrandSlider />
      {/* Product Section */}
      <section id="products" className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">Sản phẩm nổi bật</h2>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">Đang tải sản phẩm...</div>
            ) : (
              products.map((p) => (
                <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition-all">
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <img src={p.imageUrls?.[0] || '/placeholder.jpg'} alt={p.name} className="object-contain max-h-full" />
                  </div>
                  <div className="p-4 flex flex-col h-60">
                    <h3 className="font-bold text-gray-700 text-lg mb-1 line-clamp-1">{p.name}</h3>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2 flex-1">{p.description}</p>
                    <div className="text-blue-600 font-bold text-xl mb-2">{Number(p.price).toLocaleString()} ₫</div>
                    <div className="mt-auto space-y-2">
                      <Link
                        href={`shop/product/${p.id}`}
                        className="block text-center bg-blue-600 hover:bg-blue-700 text-white rounded py-2"
                      >
                        Xem chi tiết
                      </Link>
                      <button
                        onClick={() => handleAddToCart(p.id)}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded py-2"
                      >
                        Thêm vào giỏ hàng
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      <BlogPreview />
      <FAQSection />
      {/* Footer
      <footer className="bg-gray-900 text-gray-300 text-center py-6 mt-16">
        <div className="text-sm">&copy; {new Date().getFullYear()} GoCart. Mọi quyền được bảo lưu.</div>
      </footer> */}
    </div>
  );
}
