'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchCategories } from '@/services/api'; // cập nhật đường dẫn đúng nếu cần

type Category = {
  id: number;
  name: string;
};

export default function CategoryDropdown() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories().then(res => setCategories(res.data as any[]));
  }, []);

  return (
    <div className="relative group">
      <button className="px-4 py-2 hover:bg-orange-100 rounded">
        Danh mục
      </button>
      <div className="absolute hidden group-hover:block bg-white shadow-md rounded mt-2 z-10 min-w-[200px]">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.id}`}
            className="block px-4 py-2 hover:bg-orange-100 hover:text-orange-600"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
