'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5091';
import { useState, useEffect } from 'react';

export default function ProductWishlistButton({ productId }: { productId: number }) {
  const [wishlist, setWishlist] = useState<number[]>([]);

  const handleWishlistToggle = async () => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userId = user?.id;
    if (!userId) return alert("Vui lÃ²ng Ä‘Äƒng nháº­p");

    const isWishlisted = wishlist.includes(productId);

    try {
      if (isWishlisted) {
        await fetch(`${API_BASE}/api/wishlist?userId=${userId}&productId=${productId}`, { method: 'DELETE' });
        setWishlist(prev => prev.filter(id => id !== productId));
      } else {
        await fetch(`${API_BASE}/api/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: parseInt(userId), productId }),
        });
        setWishlist(prev => [...prev, productId]);
      }
    } catch (err) {
      console.error("Lá»—i khi cáº­p nháº­t wishlist:", err);
    }
  };

  return (
    <button onClick={handleWishlistToggle}>
      {wishlist.includes(productId) ? 'â¤ï¸' : 'ðŸ¤'}
    </button>
  );
}

