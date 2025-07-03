"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Wifi,
  Download,
  Share,
  Copy,
  CheckCircle,
  Zap,
  Globe,
  Timer,
  Twitter,
  Shield,
  Gauge,
  MessageCircle,
  Code,
} from "lucide-react"

// Responsive Speedometer Component
const Speedometer = ({
  speed,
  maxSpeed = 100,
}: {
  speed: number
  maxSpeed?: number
}) => {
  const normalizedSpeed = Math.min(speed, maxSpeed)
  const percentage = (normalizedSpeed / maxSpeed) * 100
  const angle = (percentage / 100) * 180 - 90 // -90 to 90 degrees

  const getSpeedColor = () => {
    if (speed < 1) return "#ef4444" // red
    if (speed < 5) return "#f59e0b" // yellow
    if (speed < 25) return "#3b82f6" // blue
    return "#10b981" // green
  }

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto aspect-square">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Outer circle */}
        <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="2" />

        {/* Speed arc background */}
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />

        {/* Speed arc fill */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={getSpeedColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(percentage / 100) * 251.2} 251.2`}
          className="transition-all duration-500 ease-out"
        />

        {/* Speed markers */}
        {[0, 10, 25, 50, 75, 100].map((mark, index) => {
          const markAngle = (mark / maxSpeed) * 180 - 90
          const x1 = 100 + 75 * Math.cos((markAngle * Math.PI) / 180)
          const y1 = 100 + 75 * Math.sin((markAngle * Math.PI) / 180)
          const x2 = 100 + 85 * Math.cos((markAngle * Math.PI) / 180)
          const y2 = 100 + 85 * Math.sin((markAngle * Math.PI) / 180)

          return (
            <g key={mark}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6b7280" strokeWidth="2" />
              <text
                x={100 + 95 * Math.cos((markAngle * Math.PI) / 180)}
                y={100 + 95 * Math.sin((markAngle * Math.PI) / 180)}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-gray-600"
                fontSize="8"
              >
                {mark}
              </text>
            </g>
          )
        })}

        {/* Center dot */}
        <circle cx="100" cy="100" r="4" fill="#374151" />

        {/* Needle */}
        <line
          x1="100"
          y1="100"
          x2={100 + 60 * Math.cos((angle * Math.PI) / 180)}
          y2={100 + 60 * Math.sin((angle * Math.PI) / 180)}
          stroke="#FE11C5"
          strokeWidth="3"
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />

        {/* Needle center */}
        <circle cx="100" cy="100" r="6" fill="#FE11C5" />
        <circle cx="100" cy="100" r="3" fill="white" />
      </svg>

      {/* Speed display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 sm:pt-6 md:pt-8">
        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{speed.toFixed(1)}</div>
        <div className="text-xs sm:text-sm text-gray-500">Mbps</div>
      </div>
    </div>
  )
}

export default function SpeedTest() {
  const [speed, setSpeed] = useState<number>(0)
  const [running, setRunning] = useState<boolean>(false)
  const [proving, setProving] = useState<boolean>(false)
  const [proofResult, setProofResult] = useState<any>(null)
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false)
  const [progressValue, setProgressValue] = useState<number>(0)
  const [copied, setCopied] = useState<boolean>(false)

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "/speedtest/speedtest.js"
    script.onload = () => {
      setScriptLoaded(true)
    }
    document.body.appendChild(script)
  }, [])

  const startSpeedTest = () => {
    if (!scriptLoaded) return

    const s = new (window as any).Speedtest()
    s.onupdate = (data: any) => {
      if (data.dlStatus) {
        setSpeed(Number.parseFloat(data.dlStatus))
      }
    }

    s.onend = () => {
      setRunning(false)
    }

    s.start()
    setRunning(true)
    setProofResult(null)
  }

  const proveSpeed = async () => {
    if (speed === 0) return

    setProving(true)
    setProgressValue(0)

    // Dummy loading animation
    const progressInterval = setInterval(() => {
      setProgressValue((prev) => {
        const next = prev + Math.random() * 15
        return next >= 99 ? 99 : next
      })
    }, 300)

    try {
      const res = await fetch("/api/prove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speed_mbps: speed, prove: true }),
      })

      const data = await res.json()
      setProofResult(data)
      setProgressValue(100)
    } catch (err) {
      console.error("Proving failed:", err)
      setProofResult({ error: "Failed to prove speed." })
    } finally {
      clearInterval(progressInterval)
      setProving(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getSpeedStatus = () => {
    if (speed === 0) return { text: "Ready to test", color: "bg-gray-100 text-gray-600" }
    if (speed < 1) return { text: "Slow", color: "bg-red-100 text-red-600" }
    if (speed < 5) return { text: "Fair", color: "bg-yellow-100 text-yellow-600" }
    if (speed < 25) return { text: "Good", color: "bg-blue-100 text-blue-600" }
    return { text: "Excellent", color: "bg-green-100 text-green-600" }
  }

  const speedStatus = getSpeedStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 p-2 sm:p-4 lg:p-6 relative">
      {/* Corner Watermark */}
      <div className="fixed top-4 right-4 z-50 hidden sm:block">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Code className="h-3 w-3 text-[#FE11C5]" />
            <span className="font-medium">Built by</span>
            <a
              href="https://twitter.com/RizzDroop23"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FE11C5] hover:text-pink-600 transition-colors font-medium"
            >
              @RizzDroop23
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 sm:space-y-4 pt-4 sm:pt-6 lg:pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-pink-100 rounded-full">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-[#FE11C5]" />
            <span className="text-pink-700 font-medium text-sm sm:text-base">Internet Speed Test</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#FE11C5] to-pink-500 bg-clip-text text-transparent px-4">
            Proof of Speed
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
            Test your internet connection speed and get a cryptographic proof of your download performance
          </p>
        </div>

        {/* Main Test Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Speed Test Card */}
          <Card className="border-0 shadow-xl sm:shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2 p-4 sm:p-6">
              <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-pink-100 rounded-full">
                  <Download className="h-5 w-5 sm:h-6 sm:w-6 text-[#FE11C5]" />
                </div>
                <CardTitle className="text-xl sm:text-2xl text-gray-800">Speed Test</CardTitle>
              </div>

              {!running && !proving && (
                <Button
                  onClick={startSpeedTest}
                  disabled={!scriptLoaded}
                  className="bg-gradient-to-r from-[#FE11C5] to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full sm:w-auto"
                >
                  {!scriptLoaded ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Wifi className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      {running ? "Testing..." : "Start Speed Test"}
                    </>
                  )}
                </Button>
              )}
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {/* Current Speed Display */}
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="relative">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 tabular-nums">
                    {speed.toFixed(2)}
                  </div>
                  <div className="text-lg sm:text-xl text-gray-500 font-medium">Mbps</div>
                  {running && (
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                      <div className="animate-pulse bg-green-500 rounded-full h-3 w-3 sm:h-4 sm:w-4"></div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Badge className={`${speedStatus.color} px-2 sm:px-3 py-1 text-xs sm:text-sm`}>
                    <Globe className="mr-1 h-3 w-3" />
                    {speedStatus.text}
                  </Badge>
                  {running && (
                    <Badge className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 animate-pulse text-xs sm:text-sm">
                      <Timer className="mr-1 h-3 w-3" />
                      Testing...
                    </Badge>
                  )}
                </div>

                {!running && speed > 0 && (
                  <p className="text-gray-600 text-sm sm:text-base">
                    Download Speed: <span className="font-semibold text-[#FE11C5]">{speed} Mbps</span>
                  </p>
                )}
              </div>

              {/* Prove Speed Button */}
              {!running && speed > 0 && !proving && (
                <div className="text-center">
                  <Button
                    onClick={proveSpeed}
                    disabled={speed === 0 || proving || running}
                    className="bg-gradient-to-r from-[#FE11C5] to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
                  >
                    <Shield className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Prove Speed
                  </Button>
                </div>
              )}

              {/* Proving Progress */}
              {proving && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-[#FE11C5]"></div>
                      Generating Proof...
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-[#FE11C5]">{Math.round(progressValue)}%</span>
                  </div>
                  <Progress value={progressValue} className="h-2 sm:h-3" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Speedometer Card */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Gauge className="h-4 w-4 sm:h-5 sm:w-5 text-[#FE11C5]" />
                Speed Gauge
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-4 sm:py-6 lg:py-8 p-4 sm:p-6">
              <Speedometer speed={speed} maxSpeed={100} />
            </CardContent>
          </Card>
        </div>

        {/* Proof Result */}
        {proofResult && (
          <Card className="border-0 shadow-xl bg-gradient-to-r from-pink-50 to-purple-50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <div className="p-1.5 sm:p-2 bg-pink-100 rounded-full">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#FE11C5]" />
                </div>
                Proof Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {proofResult.error ? (
                <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 font-medium text-sm sm:text-base">{proofResult.error}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Speed Proof Hash:</label>
                      <div className="flex items-start gap-2 p-3 sm:p-4 bg-white rounded-lg border shadow-sm">
                        <code className="text-xs sm:text-sm text-gray-800 font-mono flex-1 break-all leading-relaxed">
                          {proofResult.speed_proof}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(proofResult.speed_proof)}
                          className="shrink-0 hover:bg-pink-50 p-1 sm:p-2"
                        >
                          {copied ? (
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Verified Result:</label>
                      <div className="p-3 sm:p-4 bg-white rounded-lg border shadow-sm">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-800">
                          {proofResult.verified_result} <span className="text-base sm:text-lg text-gray-500">Mbps</span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">Cryptographically Verified</div>
                      </div>
                    </div>
                  </div>

                  {/* Twitter Share */}
                  <div className="flex justify-center pt-2 sm:pt-4">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `🚀 Just ran a Proof of Speed on\n\nhttps://proof-of-speed-et1k.vercel.app/ powered by Succinct SP1\n\n🔐 Speed Proof Hash:\n${proofResult.speed_proof}\n⚡ Verified Download Speed: ${proofResult.verified_result} Mbps\n\nScaling real-world verifiability — one proof at a time.\n\n#Succinct #SP1 #Succinct #SP1 @RizzDroop23 @SuccinctLabs @0xCRASHOUT `,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FE11C5] to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold text-sm sm:text-base w-full sm:w-auto justify-center"
                    >
                      <Twitter className="h-3 w-3 sm:h-4 sm:w-4" />
                      Share on Twitter
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                <Download className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Real-Time Testing</div>
              <div className="text-xs sm:text-sm text-gray-600">
                Accurate speed measurements using advanced algorithms
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Cryptographic Proof</div>
              <div className="text-xs sm:text-sm text-gray-600">Tamper-proof verification of your speed results</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                <Share className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Social Sharing</div>
              <div className="text-xs sm:text-sm text-gray-600">Share your verified results on social media</div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Watermark */}
        <div className="border-t border-gray-200 pt-6 pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Code className="h-4 w-4 text-[#FE11C5]" />
              <span>Crafted with ❤️ by</span>
              <a
                href="https://twitter.com/RizzDroop23"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#FE11C5] hover:text-pink-600 transition-colors font-medium"
              >
                <Twitter className="h-3 w-3" />
                @RizzDroop23
              </a>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>Discord:</span>
                <span className="font-medium text-gray-700">rizzgm</span>
              </div>
              <div className="text-xs">© 2025 Speed Test App</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
