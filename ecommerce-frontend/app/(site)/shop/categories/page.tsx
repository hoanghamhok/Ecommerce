const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5091';
import Link from "next/link";

type Category = {
  id: number;
  name: string;
  description?: string;
  createdAt: string; // hoáº·c Date náº¿u báº¡n muá»‘n xá»­ lÃ½ ngÃ y thÃ¡ng
};

export default async function CategoriesPage() {
  const res = await fetch(`${API_BASE}/api/categories`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return <div className="p-6 text-red-500">KhÃ´ng thá»ƒ táº£i danh má»¥c.</div>;
  }

  const categories: Category[] = await res.json();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Danh má»¥c sáº£n pháº©m</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop/categories/${category.id}`}
            className="p-4 border rounded-lg hover:shadow-md transition bg-white"
          >
            <h2 className="text-xl font-semibold text-gray-800">{category.name}</h2>
            {category.description && (
              <p className="text-sm text-gray-500 mt-1">{category.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

