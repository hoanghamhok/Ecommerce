'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

/* =================== CONFIG =================== */
const API_BASE = 'http://localhost:5091';

/* =================== FETCHERS =================== */
async function fetchOrders() {
  const res = await fetch(`${API_BASE}/api/Order/admin`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Fetch orders failed: ${res.status}`);
  return res.json();
}
async function fetchUsers() {
  const res = await fetch(`${API_BASE}/api/users`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Fetch users failed: ${res.status}`);
  return res.json();
}

/* =================== DATE HELPERS (an toàn) =================== */
function toDateSafe(v: any): Date | null {
  if (!v && v !== 0) return null;
  if (v instanceof Date) return isNaN(+v) ? null : v;
  if (typeof v === 'number') {
    const d = new Date(v > 1e12 ? v : v * 1000);
    return isNaN(+d) ? null : d;
  }
  if (typeof v === 'string') {
    const d = new Date(v);
    if (!isNaN(+d)) return d;
    const m = v.match(/\/Date\((\d+)\)\//); // .NET kiểu cũ
    if (m) {
      const d2 = new Date(Number(m[1]));
      return isNaN(+d2) ? null : d2;
    }
  }
  return null;
}
function fmtMonthSafe(v: any): string | null {
  const d = toDateSafe(v);
  if (!d) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function lastNMonths(n = 6): string[] {
  const now = new Date();
  const arr: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    arr.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return arr;
}

/* =================== AGG UTILS =================== */
// Đếm theo tháng
function groupMonthlyCount<T>(items: T[], getDate: (x: T) => any) {
  const map = new Map<string, number>();
  for (const it of items) {
    const key = fmtMonthSafe(getDate(it));
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));
}

// Doanh thu theo tháng: SUM(orderDetails.quantity * price)
function revenueMonthlyFromDetails(orders: any[]) {
  const map = new Map<string, number>();
  for (const o of orders) {
    // API thực tế: createdAt
    const key = fmtMonthSafe(o.createdAt ?? o.CreatedAt);
    if (!key) continue;

    const details = (o.orderDetails ?? o.OrderDetails) || [];
    const orderRevenue = details.reduce((sum: number, d: any) => {
      const qty = Number(d.quantity ?? d.Quantity ?? 0);
      const price = Number(d.price ?? d.Price ?? 0);
      return sum + (isFinite(qty) && isFinite(price) ? qty * price : 0);
    }, 0);

    map.set(key, (map.get(key) ?? 0) + orderRevenue);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));
}

function ensureMonths<T extends { month: string }>(data: T[], months: string[], fill: (m: string) => T) {
  const map = new Map(data.map(d => [d.month, d]));
  return months.map(m => map.get(m) ?? fill(m));
}

/* =================== PIE DATA =================== */
function buildPieFromOrders(orders: any[]) {
  // Với dữ liệu thật: có orderDetails -> pie theo sản phẩm (tổng quantity)
  const hasDetails = orders.some(o => o.orderDetails || o.OrderDetails);
  if (hasDetails) {
    const byProduct = new Map<string, number>();
    for (const o of orders) {
      const details = (o.orderDetails ?? o.OrderDetails) || [];
      for (const d of details) {
        const name = d.productName ?? d.ProductName ?? 'Khác';
        const qty = Number(d.quantity ?? d.Quantity ?? 0);
        byProduct.set(name, (byProduct.get(name) ?? 0) + (isFinite(qty) ? qty : 0));
      }
    }
    const arr = Array.from(byProduct.entries()).map(([name, value]) => ({ name, value }));
    if (arr.length) return arr;
  }
  // fallback theo số đơn (vì không có status trong API mẫu)
  const arr = [{ name: 'Số đơn', value: orders.length || 1 }];
  return arr;
}

/* =================== MONEY FORMAT =================== */
const currencyVN = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F472B6'];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [ordersRes, usersRes] = await Promise.allSettled([fetchOrders(), fetchUsers()]);

        if (ordersRes.status === 'fulfilled') {
          const raw = ordersRes.value ?? [];
          // Chuẩn hoá: dùng createdAt & orderDetails
          const normalized = raw.map((o: any) => ({
            orderId: o.orderId ?? o.id ?? o.OrderId,
            createdAt: o.createdAt ?? o.CreatedAt, // <- API thật
            orderDetails: o.orderDetails ?? o.OrderDetails ?? [],
          }));
          setOrders(normalized);
        } else {
          console.error('Fetch orders lỗi:', ordersRes.reason);
        }

        if (usersRes.status === 'fulfilled') {
          const raw = usersRes.value ?? [];
          // Users thật có "creatAt" (typo), nên lấy creatAt trước
          const normalized = raw
            .map((u: any) => ({
              id: u.id ?? u.Id,
              createdAt: u.creatAt ?? u.createdAt ?? u.CreatedAt ?? u.created_at ?? u.createDate ?? null,
            }))
            .filter((x: any) => !!x.createdAt);
          setUsers(normalized);
        } else {
          console.error('Fetch users lỗi:', usersRes.reason);
        }

        if (ordersRes.status === 'rejected' || usersRes.status === 'rejected') {
          setError(
            `Không lấy được: ${[
              ordersRes.status === 'rejected' ? 'orders' : null,
              usersRes.status === 'rejected' ? 'users' : null,
            ].filter(Boolean).join(', ')}`
          );
        }
      } catch (e: any) {
        setError(e?.message || 'Load failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  /* ========== KPI ========== */
  const totalUsers = users.length;
  const totalOrders = orders.length;
  // Doanh thu tổng = sum(details.qty * price)
  const totalRevenue = orders.reduce((sum, o) => {
    const details = o.orderDetails || [];
    const r = details.reduce((s: number, d: any) => {
      const qty = Number(d.quantity ?? d.Quantity ?? 0);
      const price = Number(d.price ?? d.Price ?? 0);
      return s + (isFinite(qty) && isFinite(price) ? qty * price : 0);
    }, 0);
    return sum + r;
  }, 0);

  /* ========== Charts data ========== */
  const months = useMemo(() => lastNMonths(6), []);
  // Users theo tháng: dùng createdAt (đÃ normalize từ creatAt)
  const usersMonthlyRaw = useMemo(() => groupMonthlyCount(users, u => u.createdAt), [users]);
  // Revenue theo tháng: từ orderDetails & createdAt
  const revenueMonthlyRaw = useMemo(() => revenueMonthlyFromDetails(orders), [orders]);

  const usersMonthly = useMemo(
    () => ensureMonths(usersMonthlyRaw, months, (m) => ({ month: m, count: 0 })),
    [usersMonthlyRaw, months]
  );
  const revenueMonthly = useMemo(
    () => ensureMonths(revenueMonthlyRaw, months, (m) => ({ month: m, revenue: 0 })),
    [revenueMonthlyRaw, months]
  );

  // Gộp dữ liệu cho 2 chart (Line users + Bar revenue)
  const comboData = useMemo(() => {
    const mapUsers = new Map(usersMonthly.map(d => [d.month, d.count]));
    const mapRev = new Map(revenueMonthly.map(d => [d.month, d.revenue]));
    return months.map(m => ({
      name: m.replace('-', '/'),
      users: mapUsers.get(m) ?? 0,
      sales: mapRev.get(m) ?? 0,
    }));
  }, [months, usersMonthly, revenueMonthly]);

  // Pie theo sản phẩm
  const pieData = useMemo(() => buildPieFromOrders(orders), [orders]);

  if (loading) {
    return (
      <div className="pt-24 pl-72 pr-6 pb-6 min-h-screen bg-gray-50">
        <div className="bg-white rounded-xl p-6 shadow-sm">Đang tải dữ liệu dashboard…</div>
      </div>
    );
  }

  return (
    <div className="pt-24 pl-72 pr-6 pb-6 min-h-screen bg-gray-50 font-sans">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 Trang Dashboard</h1>

      {/* Cards (KPI) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <h2 className="text-gray-700 font-semibold mb-2">👥 Người dùng</h2>
          <p className="text-3xl font-extrabold text-blue-600">{totalUsers.toLocaleString('vi-VN')}</p>
          <p className="text-xs text-gray-500 mt-1">Tháng gần nhất: +{usersMonthly.at(-1)?.count ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <h2 className="text-gray-700 font-semibold mb-2">🛒 Đơn hàng</h2>
          <p className="text-3xl font-extrabold text-green-600">{totalOrders.toLocaleString('vi-VN')}</p>
          <p className="text-xs text-gray-500 mt-1">TB/tháng: {(totalOrders / Math.max(1, months.length)).toFixed(1)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <h2 className="text-gray-700 font-semibold mb-2">💰 Doanh thu</h2>
          <p className="text-3xl font-extrabold text-orange-500">{currencyVN(totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">Tháng gần nhất: {currencyVN(Number(revenueMonthly.at(-1)?.revenue ?? 0))}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: Users */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Thống kê người dùng theo tháng</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={comboData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v: any, name) => [v, name === 'users' ? 'Người dùng' : '']} />
              <Legend />
              <Line type="monotone" dataKey="users" name="Người dùng" stroke="#6366F1" strokeWidth={2} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart: Revenue by month */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Doanh thu theo tháng</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={comboData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`} />
              <Tooltip formatter={(v: any) => [currencyVN(Number(v)), 'Doanh thu']} />
              <Legend />
              <Bar dataKey="sales" name="Doanh thu" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Tỉ lệ bán theo sản phẩm
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [v, 'Số lượng']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {error && (
        <div className="mt-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-4">
          {error}
        </div>
      )}
    </div>
  );
}
