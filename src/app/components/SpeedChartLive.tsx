"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface SpeedData {
  time: string
  speed: number
}

export default function SpeedChartLive() {
  const [speedData, setSpeedData] = useState<SpeedData[]>([])

  useEffect(() => {
    // Listen for speed updates from the main component
    const handleSpeedUpdate = (event: CustomEvent) => {
      const { speed } = event.detail
      const time = new Date().toLocaleTimeString()

      setSpeedData((prev) => {
        const newData = [...prev, { time, speed }]
        // Keep only last 20 data points
        return newData.slice(-20)
      })
    }

    window.addEventListener("speedUpdate", handleSpeedUpdate as EventListener)

    return () => {
      window.removeEventListener("speedUpdate", handleSpeedUpdate as EventListener)
    }
  }, [])

  // Generate some sample data if no real data is available
  useEffect(() => {
    if (speedData.length === 0) {
      const sampleData = Array.from({ length: 10 }, (_, i) => ({
        time: new Date(Date.now() - (10 - i) * 1000).toLocaleTimeString(),
        speed: Math.random() * 2 + 0.5,
      }))
      setSpeedData(sampleData)
    }
  }, [speedData.length])

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={speedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#666" interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 12 }} stroke="#666" domain={[0, "dataMax + 1"]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            formatter={(value: number) => [`${value.toFixed(2)} Mbps`, "Download Speed"]}
          />
          <Line
            type="monotone"
            dataKey="speed"
            stroke="#FE11C5"
            strokeWidth={3}
            dot={{ fill: "#FE11C5", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#FE11C5", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
