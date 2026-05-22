const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5091';
import ProductDetailClient from '@/components/ProductDetailClient';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API_BASE}/api/products/${id}`, { cache: 'no-store' });

  if (!res.ok) {
    return <div className="p-8 text-red-600">KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m.</div>;
  }

  const product = await res.json();

  const relatedRes = await fetch(`${API_BASE}/api/products/category/${product.categoryId}`, { cache: 'no-store' });
  const relatedProducts = relatedRes.ok ? await relatedRes.json() : [];

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}

