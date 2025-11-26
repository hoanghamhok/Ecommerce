'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { addToCart, fetchProducts } from '../../services/api';
import PromoBanner from '@/components/PromoBanner';
import BrandSlider from '@/components/BrandSlider';
import BlogPreview from '@/components/BlogPreview';
import FAQSection from '@/components/FAQ';
import ProductsGrid from '@/components/ProductGrid';
import PredictionRecommendation from '@/components/PredictionBox';
import FloatingChatbot from '@/components/ChatbotAdvisorBox';

// import { Product } from '@/components/ProductGrid';
export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    fetchProducts()
      .then((res) => {
        setProducts(res.data as any[]);
      })
      .catch(() => {
        setProducts([]);
      })
      .then(() => {
        setIsLoading(false);
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
      <PredictionRecommendation />
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
      <ProductsGrid products={products} loading={isLoading} onAddToCart={handleAddToCart} />.
      <BlogPreview />
      <FAQSection />
      
    </div>
  );
}
