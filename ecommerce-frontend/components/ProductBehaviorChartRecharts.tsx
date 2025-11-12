// File: components/ProductBehaviorChartRecharts.jsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LabelList
} from 'recharts'
import { Eye, ShoppingCart, DollarSign, TrendingUp, Flag } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5091'

async function fetchAnalyticsSummary() {
  const res = await fetch(`${API_BASE}/api/analytics/summary`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Summary ${res.status}`)
  return res.json()
}

export default function ProductBehaviorChartRecharts() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const rows = await fetchAnalyticsSummary()
        setData(rows)
      } catch (e) {
        setError(e?.message || 'Load failed')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const topBy = (field) => {
    if (!data || !data.length) return { max: 0, items: [] }
    const max = data.reduce((m, r) => Math.max(m, Number(r[field] ?? 0)), 0)
    const items = data.filter(r => Number(r[field] ?? 0) === max)
    return { max, items }
  }

  const topViews = useMemo(() => topBy('views'), [data])
  const topCart = useMemo(() => topBy('addToCartCount'), [data])
  const topBuy = useMemo(() => topBy('purchaseCount'), [data])

  const topViewToCart = useMemo(() => {
    const withRate = (data || []).map(d => ({ ...d, rate: d.views > 0 ? +(d.addToCartCount / d.views * 100).toFixed(1) : 0 }))
    const max = withRate.reduce((m, r) => Math.max(m, r.rate), 0)
    const items = withRate.filter(r => r.rate === max)
    return { max, items }
  }, [data])

  const topViewToBuy = useMemo(() => {
    const withRate = (data || []).map(d => ({ ...d, rate: d.views > 0 ? +(d.purchaseCount / d.views * 100).toFixed(1) : 0 }))
    const max = withRate.reduce((m, r) => Math.max(m, r.rate), 0)
    const items = withRate.filter(r => r.rate === max)
    return { max, items }
  }, [data])

  const chartData = useMemo(() => {
    return (data || []).map((d) => {
      const fullName = d.productName || ''
      const name = fullName.length > 16 ? fullName.slice(0, 16) + '…' : fullName
      return { fullName, name, Views: d.views, AddToCart: d.addToCartCount, Purchase: d.purchaseCount }
    })
  }, [data])

  if (loading) return <div className="p-6 flex items-center text-gray-500">Đang tải báo cáo…</div>
  if (error) return <div className="p-6 text-red-600">Lỗi: {error}</div>

  return (
    <div className="space-y-8 w-full max-w-[calc(100vw-22rem)] ml-auto pr-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="rounded-2xl p-5 shadow-sm border border-gray-100 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-full bg-blue-100"><Eye className="text-blue-600" size={20} /></div>
            <div className="text-sm font-medium text-gray-500 uppercase">Lượt xem cao nhất</div>
          </div>
          <div className="text-4xl font-extrabold text-gray-800 mb-2">{topViews.max}</div>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            {topViews.items.map((i, idx) => <li key={idx} title={i.productName} className="truncate">{i.productName}</li>)}
          </ul>
        </div>

        <div className="rounded-2xl p-5 shadow-sm border border-gray-100 bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-full bg-green-100"><ShoppingCart className="text-green-600" size={20} /></div>
            <div className="text-sm font-medium text-gray-500 uppercase">Thêm giỏ nhiều nhất</div>
          </div>
          <div className="text-4xl font-extrabold text-gray-800 mb-2">{topCart.max}</div>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            {topCart.items.map((i, idx) => <li key={idx} title={i.productName} className="truncate">{i.productName}</li>)}
          </ul>
        </div>

        <div className="rounded-2xl p-5 shadow-sm border border-gray-100 bg-gradient-to-br from-amber-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-full bg-amber-100"><DollarSign className="text-amber-600" size={20} /></div>
            <div className="text-sm font-medium text-gray-500 uppercase">Mua nhiều nhất</div>
          </div>
          <div className="text-4xl font-extrabold text-gray-800 mb-2">{topBuy.max}</div>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            {topBuy.items.map((i, idx) => <li key={idx} title={i.productName} className="truncate">{i.productName}</li>)}
          </ul>
        </div>

        <div className="rounded-2xl p-5 shadow-sm border border-gray-100 bg-gradient-to-br from-purple-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-full bg-purple-100"><TrendingUp className="text-purple-600" size={20} /></div>
            <div className="text-sm font-medium text-gray-500 uppercase">Tỷ lệ View→Cart cao nhất</div>
          </div>
          <div className="text-2xl font-extrabold text-gray-800 mb-2">{topViewToCart.max}%</div>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            {topViewToCart.items.map((i, idx) => <li key={idx} title={i.productName} className="truncate">{i.productName}</li>)}
          </ul>
        </div>

        <div className="rounded-2xl p-5 shadow-sm border border-gray-100 bg-gradient-to-br from-rose-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-full bg-rose-100"><Flag className="text-rose-600" size={20} /></div>
            <div className="text-sm font-medium text-gray-500 uppercase">Tỷ lệ View→Buy cao nhất</div>
          </div>
          <div className="text-2xl font-extrabold text-gray-800 mb-2">{topViewToBuy.max}%</div>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            {topViewToBuy.items.map((i, idx) => <li key={idx} title={i.productName} className="truncate">{i.productName}</li>)}
          </ul>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition w-full overflow-x-auto">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📊 Hành vi mua hàng</h2>
        {chartData.length === 0 ? (
          <div className="text-gray-500">Chưa có dữ liệu để hiển thị.</div>
        ) : (
          <div className="min-w-[800px]">
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={chartData} barCategoryGap="10%" margin={{ top: 20, right: 20, left: 4, bottom: 36 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 600, fill: '#374151' }} tickMargin={10} />
                <YAxis tick={{ fontSize: 12, fill: '#4B5563' }} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} labelFormatter={(_, p) => p?.[0]?.payload?.fullName ?? ''} />
                <Legend wrapperStyle={{ paddingTop: 12 }} />
                <defs>
                  <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.95} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.65} />
                  </linearGradient>
                  <linearGradient id="cartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34D399" stopOpacity={0.95} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.65} />
                  </linearGradient>
                  <linearGradient id="purchaseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.95} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.65} />
                  </linearGradient>
                </defs>
                <Bar dataKey="Views" fill="url(#viewGrad)" radius={[8, 8, 0, 0]} barSize={22}>
                  <LabelList dataKey="Views" position="top" fill="#2563EB" fontSize={11} />
                </Bar>
                <Bar dataKey="AddToCart" fill="url(#cartGrad)" radius={[8, 8, 0, 0]} barSize={22}>
                  <LabelList dataKey="AddToCart" position="top" fill="#047857" fontSize={11} />
                </Bar>
                <Bar dataKey="Purchase" fill="url(#purchaseGrad)" radius={[8, 8, 0, 0]} barSize={22}>
                  <LabelList dataKey="Purchase" position="top" fill="#B45309" fontSize={11} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
