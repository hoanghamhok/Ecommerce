'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Heart,
  ShoppingCart,
  Eye,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  MapPin,
  Truck,
  Shield,
  X,
  Zap
} from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';

type Product = {
  id: number;
  name: string;
  price: number;
  imageUrls?: string;
  category?: string;
  rating?: number;
  reviews?: number;
  discount?: number;
  // discount?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
};

type SortOption = 'name' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
type ViewMode = 'grid' | 'list';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const keyword = searchParams.get('search');

  const categories = ['Điện thoại', 'Laptop', 'Thời trang', 'Phụ kiện', 'Đồng hồ', 'Đồ gia dụng'];

  useEffect(() => {
    if (keyword) {
      setSearchInput(keyword);
    }
  }, [keyword]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const apiUrl = keyword
          ? `http://localhost:5091/api/products/search?keyword=${encodeURIComponent(keyword)}`
          : `http://localhost:5091/api/products`;

        const res = await fetch(apiUrl);
        const data = await res.json();
        
        // Enhanced product data with mock values
        const enhancedProducts = data.map((product: Product) => ({
          ...product,
          rating: 4.5 + Math.random() * 0.5,
          reviews: Math.floor(Math.random() * 200) + 10,
          category: categories[Math.floor(Math.random() * categories.length)],
          // discount: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 5 : 0,
          isNew: Math.random() > 0.8,
          isBestSeller: Math.random() > 0.85
        }));
        
        setProducts(enhancedProducts);
        setFilteredProducts(enhancedProducts);
      } catch (err) {
        console.error('Lỗi khi tải sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword]);

  // Filter and sort logic
  useEffect(() => {
    let filtered = [...products];

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.includes(product.category || '')
      );
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return b.isNew ? 1 : -1;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategories, priceRange, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchInput)}`);
    } else {
      router.push('/shop');
    }
  };

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 10000000 });
    setSortBy('name');
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-8">
              <div className="h-8 bg-slate-300 rounded-lg w-64"></div>
              <div className="flex space-x-2">
                <div className="h-10 w-32 bg-slate-300 rounded-lg"></div>
                <div className="h-10 w-20 bg-slate-300 rounded-lg"></div>
              </div>
            </div>
            
            {/* Products Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="h-48 bg-slate-300 rounded-xl mb-4"></div>
                  <div className="h-4 bg-slate-300 rounded mb-2"></div>
                  <div className="h-4 bg-slate-300 rounded w-2/3 mb-4"></div>
                  <div className="h-10 bg-slate-300 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
                {keyword ? `Kết quả tìm kiếm` : 'Tất cả sản phẩm'}
              </h1>
              {keyword && (
                <p className="text-xl text-slate-600">
                  cho "{keyword}" - {filteredProducts.length} sản phẩm
                </p>
              )}
              <p className="text-slate-500 mt-2">
                Khám phá bộ sưu tập sản phẩm chất lượng cao của GoCart
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full lg:w-96">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent shadow-sm"
                />
              </form>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-200"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Bộ lọc</span>
                {(selectedCategories.length > 0 || priceRange.min > 0 || priceRange.max < 1000000000) && (
                  <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                    {selectedCategories.length + (priceRange.min > 0 || priceRange.max < 1000000000 ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                Hiển thị {filteredProducts.length} sản phẩm
              </span>
              
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-white border border-slate-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                >
                  <option value="name">Tên A-Z</option>
                  <option value="price-asc">Giá thấp đến cao</option>
                  <option value="price-desc">Giá cao đến thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="newest">Mới nhất</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Bộ lọc tìm kiếm</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Xóa tất cả
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Filter */}
                {/* <div>
                  <h4 className="font-medium text-slate-900 mb-3">Danh mục</h4>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label key={category} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                            }
                          }}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-slate-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div> */}

                {/* Price Range Filter */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Khoảng giá</h4>
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Từ</label>
                        <input
                          type="number"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Đến</label>
                        <input
                          type="number"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          placeholder="10000000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-16 h-16 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy sản phẩm</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm của bạn. Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.
            </p>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          /* Products Grid/List */
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
              : 'space-y-6'
          }`}>
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-slate-300 ${
                  viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Product Image */}
                <div className={`relative overflow-hidden ${
                  viewMode === 'list' ? 'sm:w-64 flex-shrink-0' : ''
                }`}>
                  <img
                    src={product.imageUrls?.[0] || '/default-image.png'}
                    alt={product.name}
                    className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                      viewMode === 'list' ? 'h-48 sm:h-full' : 'h-64'
                    }`}
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col space-y-2">
                    {product.isNew && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>MỚI</span>
                      </span>
                    )}
                    {product.isBestSeller && (
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        BÁN CHẠY
                      </span>
                    )}
                    
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg group/heart"
                  >
                    <Heart className={`w-5 h-5 transition-colors duration-200 ${
                      wishlist.has(product.id) 
                        ? 'text-red-500 fill-current' 
                        : 'text-slate-400 group-hover/heart:text-red-500'
                    }`} />
                  </button>

                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex space-x-3">
                      <Link
                        href={`/shop/product/${product.id}`}
                        className="bg-white text-slate-900 p-3 rounded-full hover:bg-slate-100 transition-colors duration-200 shadow-lg"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button className="bg-emerald-500 text-white p-3 rounded-full hover:bg-emerald-600 transition-colors duration-200 shadow-lg">
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className={`p-6 flex flex-col justify-between flex-grow ${
                  viewMode === 'list' ? 'sm:p-8' : ''
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-slate-600">{product.rating?.toFixed(1)}</span>
                        <span className="text-xs text-slate-400">({product.reviews})</span>
                      </div>
                    </div>
                    
                    <h3 className={`font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors ${
                      viewMode === 'list' ? 'text-xl' : 'text-lg'
                    }`}>
                      {product.name}
                    </h3>
                    {/* <div className="text-blue-600 font-bold text-xl mb-2">{Number(product.price).toLocaleString()} ₫</div> */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {product.discount && product.discount > 0 ? (
                          <>
                            <span className={`font-bold text-emerald-600 ${
                              viewMode === 'list' ? 'text-2xl' : 'text-xl'
                            }`}>
                              {(product.price * (1 - product.discount / 100)).toLocaleString()}₫
                            </span>
                            <span className="text-slate-400 line-through text-sm">
                              {product.price.toLocaleString()}₫
                            </span>
                          </>
                        ) : (
                          <span className={`font-bold text-emerald-600 ${
                            viewMode === 'list' ? 'text-2xl' : 'text-xl'
                          }`}>
                            {product.price.toLocaleString()}₫
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex items-center space-x-4 text-xs text-slate-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Truck className="w-3 h-3" />
                        <span>Giao nhanh</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Shield className="w-3 h-3" />
                        <span>Bảo hành</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={`space-y-3 ${viewMode === 'list' ? 'sm:flex sm:space-y-0 sm:space-x-4' : ''}`}>
                    <Link
                      href={`/shop/product/${product.id}`}
                      className="block w-full bg-slate-900 text-white text-center py-3 px-6 rounded-xl font-semibold hover:bg-slate-800 transition-colors duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Xem chi tiết
                    </Link>
                    
                    {/* <button className={`w-full bg-emerald-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-emerald-600 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 ${
                      viewMode === 'list' ? 'sm:flex-shrink-0' : ''
                    }`}> */}
                      <AddToCartButton  productId={product.id}/>
                      {/* <ShoppingCart className="w-4 h-4" />
                      <span>Thêm vào giỏ</span> */}
                    {/* </button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredProducts.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-white text-slate-700 border border-slate-300 px-8 py-3 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all duration-200">
              Xem thêm sản phẩm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}