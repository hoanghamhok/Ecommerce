'use client';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5091';
// app/components/ReviewSection.tsx
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
      alert("Báº¡n cáº§n Ä‘Äƒng nháº­p Ä‘á»ƒ gá»­i Ä‘Ã¡nh giÃ¡.");
      return;
    }

    setLoading(true);
    const res = await fetch(`${API_BASE}/api/Review`, {
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
      alert("Gá»­i tháº¥t báº¡i");
    }
  };

  if (submitted) return <span className="text-green-600 text-sm">ÄÃ£ Ä‘Ã¡nh giÃ¡</span>;

  return (
    <div>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          ÄÃ¡nh giÃ¡
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
            placeholder="Nháº­n xÃ©t..."
            required
          />

          <div className="flex gap-2 justify-center items-center">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-1 rounded text-sm"
              disabled={loading}
            >
              {loading ? "Äang gá»­i..." : "Gá»­i"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-gray-500 underline"
            >
              Há»§y
            </button>
          </div>
        </form>
      )}
    </div>
  );
}


