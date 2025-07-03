
import dynamic from 'next/dynamic'
const SpeedChartLive = dynamic(() => import('@/app/components/SpeedChartLive'), {
  ssr: false,
})

export default function ChartWrapper() {
  return <SpeedChartLive />;
}