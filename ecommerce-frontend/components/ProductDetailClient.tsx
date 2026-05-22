'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5091';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Star, StarHalf } from 'lucide-react';
import Link from 'next/link';
import AddToCartButton from './AddToCartButton';
import dynamic from 'next/dynamic';

function StarRating({ rating }: { rating: number }) {
  const totalStars = 5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const stars = [];

  for (let i = 0; i < totalStars; i++) {
    if (i < fullStars) {
      // full star
      stars.push(<Star key={i} className="text-yellow-500" fill="currentColor" />);
    } else if (i === fullStars && hasHalfStar) {
      // half star
      stars.push(<StarHalf key={i} className="text-yellow-500" />);
    } else {
      // empty star
      stars.push(<Star key={i} className="text-yellow-500" fill="none" />);
    }
  }

  return <div className="flex space-x-1">{stars}</div>;
}

export default function ProductDetailClient({ product, relatedProducts }: { product: any, relatedProducts: any[] }) {
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingRating, setLoadingRating] = useState(false);
  const [mainImage, setMainImage] = useState(product.imageUrls?.[0] || '/default-image.png');

  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const res = await fetch(`${API_BASE}/api/Review/product/${product.id}?page=1&pageSize=10`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (error) {
        console.error('Lá»—i khi táº£i reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    const fetchRating = async () => {
      setLoadingRating(true);
      try {
        const res = await fetch(`${API_BASE}/api/Review/product/${product.id}/rating`);
        if (res.ok) {
          const data = await res.json();
          setRating(data.averageRating || data);
        }
      } catch (error) {
        console.error('Lá»—i khi táº£i rating:', error);
      } finally {
        setLoadingRating(false);
      }
    };

    fetchReviews();
    fetchRating();
  }, [product.id]);

  const handleAddToWishlist = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userId = user?.id;

    if (!userId || !token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, productId: product.id }),
      });

      if (res.ok) {
        setAdded(true);
      } else {
        const err = await res.text();
        console.error('Lá»—i khi thÃªm wishlist:', err);
      }
    } catch (err) {
      console.error('Lá»—i káº¿t ná»‘i:', err);
    }
  };
  const [showFullDescription, setShowFullDescription] = useState(false);
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-blue-600">Trang chá»§</Link> &gt;{' '}
        <Link href="/shop/categories" className="hover:text-blue-600">Danh má»¥c</Link> &gt;{' '}
        <span className="text-gray-700 font-medium">{product.name}</span>
      </nav>

      {/* ThÃ´ng tin sáº£n pháº©m */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-xl shadow-2xl p-8">
      <div className="flex flex-col items-center">
        {product.imageUrls?.length > 0 ? (
          <div className="relative w-80 h-80">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Náº¿u nhiá»u áº£nh, thÃªm slider/carousel á»Ÿ Ä‘Ã¢y */}
          </div>
        ) : (
          <div className="w-80 h-80 flex items-center justify-center bg-gray-100 rounded-xl">
            <span className="text-gray-400">KhÃ´ng cÃ³ áº£nh</span>
          </div>
        )}
        <div className="flex gap-2 mt-4">
          {product.imageUrls?.slice(0).map((url: string, i: number) => (
            <img
              key={i}
              src={url}
              alt={`áº¢nh phá»¥ ${i + 1}`}
              onClick={() => setMainImage(url)}
              className={`w-16 h-16 rounded-md object-cover border hover:border-blue-400 transition cursor-pointer ${
                url === mainImage ? 'ring-2 ring-blue-500' : ''
              }`}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-between space-y-6">
        <div>
           <div>
            <h3 className="text-4xl text-gray-900 font-normal">{product.name}</h3>
            <div
              className={`mt-2 text-gray-700 text-sm leading-relaxed transition-all duration-300 ${
                showFullDescription ? '' : 'line-clamp-3'
              }`}
              dangerouslySetInnerHTML={{ __html: product.description || '' }}
            ></div>
            {(product.description?.length ?? 0) > 0 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-2 text-blue-600 hover:underline text-sm font-medium"
              >
                {showFullDescription ? 'Thu gá»n â–²' : 'Xem thÃªm â–¼'}
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-red-600">{product.price.toLocaleString()} â‚«</div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.instock > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
            {product.instock > 0 ? 'CÃ²n hÃ ng' : 'Háº¿t hÃ ng'}
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <AddToCartButton productId={product.id} />
          <button
            onClick={handleAddToWishlist}
            className={`p-2 rounded-full border ${added ? 'bg-red-100 text-red-500' : 'hover:bg-gray-100 text-gray-400'}`}
            aria-label={added ? 'ÄÃ£ thÃªm vÃ o wishlist' : 'ThÃªm vÃ o wishlist'}
            disabled={added}
          >
            <Heart fill={added ? 'red' : 'none'} />
          </button>
        </div>
      </div>
    </div>


      {/* ÄÃ¡nh giÃ¡ sáº£n pháº©m */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">ÄÃ¡nh giÃ¡ sáº£n pháº©m</h2>
        {loadingReviews ? (
          <p>Äang táº£i Ä‘Ã¡nh giÃ¡...</p>
        ) : reviews.length === 0 ? (
          <p>ChÆ°a cÃ³ Ä‘Ã¡nh giÃ¡ nÃ o cho sáº£n pháº©m nÃ y.</p>
        ) : (
          <ul className="space-y-4 max-h-96 overflow-y-auto">
            {reviews.map((review) => (
              <li key={review.id} className="border-b border-gray-200 pb-4">
                <p className="font-semibold">{review.userName || 'NgÆ°á»i dÃ¹ng'}</p>
                <StarRating rating={review.rating} />
                <p className="text-gray-700">{review.comment}</p>
                <p className="text-sm text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sáº£n pháº©m liÃªn quan */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sáº£n pháº©m liÃªn quan</h2>
        <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
          {relatedProducts
            .filter((p) => p.id !== product.id)
            .slice(0, 4)
            .map((p) => (
              <Link
                key={p.id}
                href={`/shop/product/${p.id}`}
                className="bg-white rounded-lg shadow hover:shadow-xl transition p-4 flex flex-col"
              >
                <img
                  src={
                    p.imageUrls && p.imageUrls.length > 0
                      ? p.imageUrls[0]
                      : 'https://via.placeholder.com/200'
                  }
                  alt={p.name}
                  className="rounded-md h-40 object-contain mb-3"
                />
                <h3 className="text-gray-800 font-medium truncate">{p.name}</h3>
                <p className="text-red-500 text-sm font-semibold mt-1">
                  {p.price.toLocaleString()} â‚«
                </p>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}

