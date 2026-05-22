const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5091';
// utils/cart.ts
export const addToCart = async ({ productId, quantity }: { productId: number; quantity: number }) => {
  const res = await fetch(`${API_BASE}/api/Cart/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ productId, quantity })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "ThÃªm giá» hÃ ng tháº¥t báº¡i");
  }

  return res.json();
};

export const handleAddToCart = async (productId: number) => {
  try {
    await addToCart({ productId, quantity: 1 });
    alert("ÄÃ£ thÃªm sáº£n pháº©m vÃ o giá».");
  } catch (err) {
    alert("Lá»—i khi thÃªm sáº£n pháº©m vÃ o giá».");
  }
};

