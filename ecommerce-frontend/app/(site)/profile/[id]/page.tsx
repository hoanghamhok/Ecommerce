'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5091';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
};

export default function ProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/${id}`);;
        if (!res.ok) throw new Error('Lá»—i khi gá»i API ngÆ°á»i dÃ¹ng');
        const data: User = await res.json();
        setUser(data);
      } catch (error) {
        console.error('Lá»—i:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  if (loading) return <p>Äang táº£i thÃ´ng tin...</p>;
  if (!user) return <p className="text-red-500">KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Há»“ sÆ¡ ngÆ°á»i dÃ¹ng</h1>
      <p><strong>TÃªn:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Phone:</strong> {user.phone}</p>
      <p><strong>Address:</strong> {user.address}</p>
    </div>
  );
}

