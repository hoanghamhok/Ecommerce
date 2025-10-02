// app/components/ReviewSection.tsx
"use client";
import { useState } from "react";

export default function ReviewSection({ productId }: { productId: number }) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("Bạn cần đăng nhập để gửi đánh giá.");
      return;
    }

    setLoading(true);
    const res = await fetch("http://localhost:5091/api/Review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/plain",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, rating, comment }),
    });

    setLoading(false);
    if (res.ok) {
      setSubmitted(true);
      setShowForm(false);
    } else {
      alert("Gửi thất bại");
    }
  };

  if (submitted) return <span className="text-green-600 text-sm">Đã đánh giá</span>;

  return (
    <div>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          Đánh giá
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-1 mt-2">
          <select
            value={rating}
            onChange={(e) => setRating(+e.target.value)}
            className="border p-1 text-sm w-full"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} sao
              </option>
            ))}
          </select>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border p-1 w-full text-sm"
            rows={3}
            placeholder="Nhận xét..."
            required
          />

          <div className="flex gap-2 justify-center items-center">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-1 rounded text-sm"
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-gray-500 underline"
            >
              Hủy
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
