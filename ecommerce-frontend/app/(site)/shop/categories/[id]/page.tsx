const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5091';
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
};

type Category = {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
};

export default async function ProductsByCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: categoryId } = await params;

  // Fetch category and products in parallel
  const [categoryRes, productsRes] = await Promise.all([
    fetch(`${API_BASE}/api/categories/${categoryId}`, { cache: "no-store" }),
    fetch(`${API_BASE}/api/products/categories/${categoryId}`, { cache: "no-store" }),
  ]);

  if (!categoryRes.ok || !productsRes.ok) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-600 px-8 py-6 rounded-2xl shadow text-center text-lg font-semibold">
          KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u. Vui lÃ²ng thá»­ láº¡i sau.
        </div>
      </div>
    );
  }

  const category: Category = await categoryRes.json();
  const products: Product[] = await productsRes.json();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
              Danh má»¥c: {category.name}
            </h1>
            {category.description && (
              <p className="text-slate-600 text-lg">{category.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <span className="bg-emerald-100 text-emerald-600 px-4 py-2 rounded-full font-semibold text-sm shadow">
              {products.length} sáº£n pháº©m
            </span>
            <span className="text-slate-400 text-xs">
              Cáº­p nháº­t: {new Date(category.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-28 h-28 mx-auto mb-6 bg-slate-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2M7 10a5 5 0 1110 0 5 5 0 01-10 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">ChÆ°a cÃ³ sáº£n pháº©m nÃ o</h2>
            <p className="text-slate-500 mb-6">HÃ£y quay láº¡i sau hoáº·c chá»n danh má»¥c khÃ¡c Ä‘á»ƒ khÃ¡m phÃ¡ thÃªm sáº£n pháº©m!</p>
            <Link
              href="/shop"
              className="inline-flex items-center bg-gradient-to-r from-blue-500 to-emerald-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-emerald-500 transition-all duration-200 shadow-lg"
            >
              Quay láº¡i cá»­a hÃ ng
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, idx) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-blue-400 overflow-hidden flex flex-col"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.imageUrl || "/default-image.png"}
                    alt={product.name}
                    className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow">
                    #{category.name}
                  </div>
                </div>
                <div className="flex-1 flex flex-col p-5">
                  <h2 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h2>
                  <div className="mb-4">
                    <span className="text-emerald-600 font-bold text-xl">
                      {product.price.toLocaleString()}â‚«
                    </span>
                  </div>
                  <div className="mt-auto">
                    <Link
                      href={`/shop/product/${product.id}`}
                      className="inline-block w-full bg-gradient-to-r from-blue-500 to-emerald-400 text-white text-center py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-emerald-500 transition-all duration-200 shadow hover:shadow-lg"
                    >
                      Xem chi tiáº¿t
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

