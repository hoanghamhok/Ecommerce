'use client';

import React, { useEffect, useState } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchCategories, uploadImage } from '@/app/(site)/services/api';
import Modal from '@/components/Modal';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  instock: number;
  imageUrls?: string[];
  discount?: number;
  categoryId: number;
  category?: any;
  createdAt?: string;
  categoryName?: string;
};

type Category = {
  id: number;
  name: string;
};

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<Omit<Product, 'id' | 'category' | 'createdAt'>>({
    name: '',
    description: '',
    price: 0,
    instock: 0,
    imageUrls: [],
    discount: 0,
    categoryId: 0,
  });

  const loadProducts = async () => {
    const res = await fetchProducts();
    setProducts(res.data as Product[]);
  };

  useEffect(() => {
    loadProducts();
    fetchCategories().then(res => setCategories(res.data as Category[]));
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      description: '',
      price: 0,
      instock: 0,
      imageUrls: [],
      discount: 0,
      categoryId: categories[0]?.id || 0
    });
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price,
      instock: product.instock,
      imageUrls: product.imageUrls || [],
      discount: product.discount || 0,
      categoryId: product.categoryId || categories[0]?.id || 0
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'price' || name === 'instock' || name === 'discount' || name === 'categoryId' ? Number(value) : value });
  };

  // Lưu sản phẩm (thêm/sửa)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      // Sửa
      updateProduct(editingProduct.id, form)
        .then(() => {
          setProducts(products.map(p => (p.id === editingProduct.id ? { ...editingProduct, ...form } : p)));
          closeModal();
        });
    } else {
      // Thêm mới
      createProduct(form)
        .then(res => {
          setProducts([...products, res.data as any]);
          closeModal();
        });
    }
  };

   // Xóa sản phẩm
  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      deleteProduct(id).then(() => setProducts(products.filter(p => p.id !== id)));
    }
  };


  return (
    <div className="ml-0 pl-72 pt-24 px-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-2">📦 Quản lý Sản phẩm</h1>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition duration-300" onClick={openAddModal}>
        ➕ Thêm mới sản phẩm
      </button>

      <div className="overflow-x-auto mt-6">
        <table className="min-w-full bg-white shadow-xl rounded-xl overflow-hidden">
          <thead className="bg-blue-100 text-gray-700 text-sm uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Tên sản phẩm</th>
              <th className="py-3 px-4 text-left">Mô tả</th>
              <th className="py-3 px-4 text-left">Giá</th>
              <th className="py-3 px-4 text-left">Tồn kho</th>
              <th className="py-3 px-4 text-left">Danh mục</th>
              <th className="py-3 px-4 text-left">Giảm giá</th>
              <th className="py-3 px-4 text-left">Ảnh</th>
              <th className="py-3 px-4 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, index) => (
              <tr key={p.id} className={`transition duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                <td className="px-4 py-2">{p.id}</td>
                <td className="px-4 py-2 font-medium">{p.name}</td>
                <td className="px-4 py-2 text-gray-600">{p.description}</td>
                <td className="px-4 py-2 text-blue-600 font-semibold">{p.price.toLocaleString()} đ</td>
                <td className="px-4 py-2">{p.instock}</td>
                <td className="px-4 py-2">{p.categoryName || 'Không có'}</td>
                <td className="px-4 py-2 text-red-500">{p.discount}%</td>
                <td className="px-4 py-2">
                  {p.imageUrls && p.imageUrls.length > 0 && p.imageUrls.map((url, idx) => (
                    <img key={idx} src={url} alt={p.name} className="w-16 h-16 object-cover rounded shadow inline-block mr-2" />
                  ))}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded shadow" onClick={() => openEditModal(p)}>Sửa</button>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow" onClick={() => handleDelete(p.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal}>
        <form onSubmit={handleSave} className=" bg-white rounded-lg p-6 text-gray-900">
          <h2 className="text-xl font-bold">{editingProduct ? '🛠 Sửa sản phẩm' : '➕ Thêm mới sản phẩm'}</h2>
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Tên sản phẩm" className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="text" name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" className="w-full border border-gray-300 p-2 rounded" />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Giá" min={0} step="0.01" className="border border-gray-300 p-2 rounded" required />
            <input type="number" name="instock" value={form.instock} onChange={handleChange} placeholder="Tồn kho" min={0} className="border border-gray-300 p-2 rounded" required />
          </div>
          <input type="number" name="discount" value={form.discount ?? 0} onChange={handleChange} placeholder="Giảm giá (%)" min={0} max={100} className="w-full border border-gray-300 p-2 rounded" />
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={async (e) => {
              if (e.target.files && e.target.files.length > 0) {
                setUploading(true);
                try {
                  const formData = new FormData();
                  Array.from(e.target.files).forEach(file => formData.append("files", file));

                  const res = await uploadImage(formData);
                  const data = res.data as { imageUrls: string[] };

                  if (data?.imageUrls?.length) {
                    setForm(prev => ({
                      ...prev,
                      imageUrls: [...(prev.imageUrls ?? []), ...data.imageUrls] // 🔥 nối ảnh cũ + mới
                    }));
                  } else {
                    alert("Không nhận được danh sách ảnh.");
                  }
                } catch (err) {
                  console.error('Upload failed', err);
                  alert("Tải ảnh thất bại");
                }
                setUploading(false);
              }
            }}
            className="w-full border p-2 rounded"
          />
          {(form.imageUrls?.length ?? 0) > 0 && (
            <img
              src={form.imageUrls![0]}
              alt="Ảnh đại diện"
              className="w-32 h-32 object-cover mt-2 rounded border shadow"
            />
          )}
          {uploading && <p className="text-blue-600 text-sm">Đang tải ảnh lên...</p>}
          <select name="categoryId" value={form.categoryId} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded" required>
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c) => (<option value={c.id} key={c.id}>{c.name}</option>))}
          </select>
          <div className="flex justify-center gap-4 pt-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition">{editingProduct ? '💾 Cập nhật' : '✅ Thêm mới'}</button>
            <button type="button" onClick={closeModal} className="bg-gray-400 text-white px-4 py-2 rounded shadow hover:bg-gray-500 transition">❌ Đóng</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
