import ProductBehaviorChartRecharts from '@/components/ProductBehaviorChartRecharts'
// hoặc dùng Chart.js: import ProductBehaviorChartChartjs from '@/components/ProductBehaviorChartChartjs'

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Báo cáo hành vi người dùng</h1>
      <ProductBehaviorChartRecharts />
      {/* <div className="mt-8"><ProductBehaviorChartChartjs /></div> */}
    </div>
  )
}
