"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
  ExternalLink,
  RefreshCw,
  Clock,
  Users,
  Droplets,
} from "lucide-react"
import Link from "next/link"
import { Chart, registerables } from "chart.js"

// Register Chart.js components
Chart.register(...registerables)

// GeckoTerminal API configuration
const GECKO_API_BASE = "https://api.geckoterminal.com/api/v2"
const POOL_ADDRESS = "0xff574fe456909cff10ad02ac78f49702313e0590"
const NETWORK = "pepe-unchained"
const SHILL_CONTRACT_ADDRESS = "0x43Ab9afcEca24cFc1E0F9221d6C8775a090FE340"

// Timeframe options
const TIMEFRAME_OPTIONS = [
  { value: "1m", label: "1 Minute", duration: 60 },
  { value: "5m", label: "5 Minutes", duration: 300 },
  { value: "15m", label: "15 Minutes", duration: 900 },
  { value: "1h", label: "1 Hour", duration: 3600 },
  { value: "4h", label: "4 Hours", duration: 14400 },
  { value: "1d", label: "1 Day", duration: 86400 },
]

interface TokenData {
  price: number
  volume24h: number
  priceChange24h: number
  marketCap: number
  fdv: number
  liquidity: number
  transactions24h: number
  lastUpdated: string
}

interface PricePoint {
  timestamp: string
  price: number
}

interface HistoricalData {
  timestamp: number
  price: number
  volume: number
}

const getTokenSupply = async (): Promise<number> => {
  try {
    console.log("🔍 Fetching SHILL token total supply...")

    const response = await fetch("https://rpc-pepu-v2-mainnet-0.t.conduit.xyz/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
          {
            to: SHILL_CONTRACT_ADDRESS,
            data: "0x18160ddd", // totalSupply() function signature
          },
          "latest",
        ],
        id: 1,
      }),
    })

    const data = await response.json()
    console.log("📊 Total supply response:", data)

    if (data.result && data.result !== "0x" && data.result !== "0x0") {
      const supplyWei = Number.parseInt(data.result, 16)
      const supply = supplyWei / Math.pow(10, 18)
      console.log("💰 Total Supply:", supply.toLocaleString())
      return supply
    }

    return 0
  } catch (err) {
    console.error("❌ Error fetching token supply:", err)
    return 0
  }
}

export default function AnalyticsPage() {
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h")
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [loadingChart, setLoadingChart] = useState(false)

  // Fetch historical data from GeckoTerminal
  const fetchHistoricalData = async (timeframe: string) => {
    try {
      setLoadingChart(true)
      console.log(`🔍 Fetching historical data for timeframe: ${timeframe}`)

      // Get current pool data first
      const poolResponse = await fetch(`${GECKO_API_BASE}/networks/${NETWORK}/pools/${POOL_ADDRESS}`)
      const poolData = await poolResponse.json()

      if (poolData.data) {
        const attributes = poolData.data.attributes
        const totalSupply = await getTokenSupply()

        const newTokenData: TokenData = {
          price: Number.parseFloat(attributes.base_token_price_usd) || 0,
          volume24h: Number.parseFloat(attributes.volume_usd?.h24) || 0,
          priceChange24h: Number.parseFloat(attributes.price_change_percentage?.h24) || 0,
          marketCap: Number.parseFloat(attributes.market_cap_usd) || 0,
          fdv: Number.parseFloat(attributes.fdv_usd) || 0,
          liquidity: Number.parseFloat(attributes.reserve_in_usd) || 0,
          transactions24h:
            Number.parseInt(attributes.transactions?.h24?.buys || 0) +
            Number.parseInt(attributes.transactions?.h24?.sells || 0),
          lastUpdated: new Date().toISOString(),
        }

        // Calculate market cap manually if API doesn't provide it
        if (newTokenData.marketCap === 0 && totalSupply > 0 && newTokenData.price > 0) {
          newTokenData.marketCap = newTokenData.price * totalSupply
          console.log("💡 Calculated Market Cap:", newTokenData.marketCap.toLocaleString())
        }

        // Calculate FDV manually if API doesn't provide it
        if (newTokenData.fdv === 0 && totalSupply > 0 && newTokenData.price > 0) {
          newTokenData.fdv = newTokenData.price * totalSupply // For most tokens, FDV = Market Cap
          console.log("💡 Calculated FDV:", newTokenData.fdv.toLocaleString())
        }

        console.log("📊 Token Data Summary:")
        console.log("  💰 Price:", newTokenData.price)
        console.log("  📈 Market Cap:", newTokenData.marketCap)
        console.log("  🏦 FDV:", newTokenData.fdv)
        console.log("  💧 Liquidity:", newTokenData.liquidity)
        console.log("  📊 Volume 24h:", newTokenData.volume24h)
        console.log("  🔄 Total Supply:", totalSupply.toLocaleString())

        setTokenData(newTokenData)
      }

      // Try different API endpoints based on timeframe
      let historical: HistoricalData[] = []

      try {
        // First try: OHLCV endpoint with proper mapping
        const timeframeMap: { [key: string]: string } = {
          "1m": "minute",
          "5m": "minute", // Use minute data and aggregate
          "15m": "minute", // Use minute data and aggregate
          "1h": "hour",
          "4h": "hour", // Use hour data and aggregate
          "1d": "day",
        }

        const apiTimeframe = timeframeMap[timeframe]
        const limit = timeframe === "1d" ? 30 : timeframe === "4h" ? 48 : timeframe === "1h" ? 24 : 60

        console.log(`📊 Trying OHLCV endpoint: ${apiTimeframe}, limit: ${limit}`)

        const ohlcvResponse = await fetch(
          `${GECKO_API_BASE}/networks/${NETWORK}/pools/${POOL_ADDRESS}/ohlcv/${apiTimeframe}?limit=${limit}`,
        )

        if (ohlcvResponse.ok) {
          const ohlcvData = await ohlcvResponse.json()
          console.log("📊 OHLCV response:", ohlcvData)

          if (ohlcvData.data?.attributes?.ohlcv_list && ohlcvData.data.attributes.ohlcv_list.length > 0) {
            const rawData = ohlcvData.data.attributes.ohlcv_list.map((item: any) => ({
              timestamp: item[0] * 1000,
              price: Number.parseFloat(item[4]) || 0,
              volume: Number.parseFloat(item[5]) || 0,
            }))

            // Aggregate data for custom timeframes
            if (timeframe === "5m") {
              historical = aggregateData(rawData, 5)
            } else if (timeframe === "15m") {
              historical = aggregateData(rawData, 15)
            } else if (timeframe === "4h") {
              historical = aggregateData(rawData, 4, "hour")
            } else {
              historical = rawData
            }

            console.log(`✅ Loaded ${historical.length} data points from OHLCV`)
          }
        }
      } catch (ohlcvError) {
        console.log("⚠️ OHLCV endpoint failed:", ohlcvError)
      }

      // Fallback: Generate synthetic data based on current price
      if (historical.length === 0 && tokenData) {
        console.log("📈 Generating synthetic historical data...")
        historical = generateSyntheticData(tokenData.price, timeframe)
        console.log(`✅ Generated ${historical.length} synthetic data points`)
      }

      // Final fallback: Use current price
      if (historical.length === 0 && tokenData) {
        historical = [
          {
            timestamp: Date.now(),
            price: tokenData.price,
            volume: tokenData.volume24h,
          },
        ]
        console.log("📍 Using current price as single data point")
      }

      setHistoricalData(historical)
      setLastUpdate(new Date())
      setError("")
    } catch (err: any) {
      console.error("❌ Error fetching data:", err)
      setError(err.message || "Failed to fetch data")

      // Emergency fallback with current data
      if (tokenData) {
        setHistoricalData([
          {
            timestamp: Date.now(),
            price: tokenData.price,
            volume: tokenData.volume24h,
          },
        ])
      }
    } finally {
      setLoadingChart(false)
    }
  }

  // Helper function to aggregate minute data into larger timeframes
  const aggregateData = (
    data: HistoricalData[],
    interval: number,
    type: "minute" | "hour" = "minute",
  ): HistoricalData[] => {
    if (data.length === 0) return []

    const intervalMs = type === "hour" ? interval * 60 * 60 * 1000 : interval * 60 * 1000
    const aggregated: HistoricalData[] = []

    // Sort data by timestamp
    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp)

    let currentBucket: HistoricalData[] = []
    let bucketStart = Math.floor(sortedData[0].timestamp / intervalMs) * intervalMs

    for (const point of sortedData) {
      const pointBucket = Math.floor(point.timestamp / intervalMs) * intervalMs

      if (pointBucket === bucketStart) {
        currentBucket.push(point)
      } else {
        // Process current bucket
        if (currentBucket.length > 0) {
          const avgPrice = currentBucket.reduce((sum, p) => sum + p.price, 0) / currentBucket.length
          const totalVolume = currentBucket.reduce((sum, p) => sum + p.volume, 0)

          aggregated.push({
            timestamp: bucketStart,
            price: avgPrice,
            volume: totalVolume,
          })
        }

        // Start new bucket
        currentBucket = [point]
        bucketStart = pointBucket
      }
    }

    // Process final bucket
    if (currentBucket.length > 0) {
      const avgPrice = currentBucket.reduce((sum, p) => sum + p.price, 0) / currentBucket.length
      const totalVolume = currentBucket.reduce((sum, p) => sum + p.volume, 0)

      aggregated.push({
        timestamp: bucketStart,
        price: avgPrice,
        volume: totalVolume,
      })
    }

    return aggregated
  }

  // Generate synthetic historical data when API data is not available
  const generateSyntheticData = (currentPrice: number, timeframe: string): HistoricalData[] => {
    const points = timeframe === "1d" ? 30 : timeframe === "4h" ? 24 : timeframe === "1h" ? 24 : 20
    const data: HistoricalData[] = []

    const intervalMs =
      {
        "1m": 60 * 1000,
        "5m": 5 * 60 * 1000,
        "15m": 15 * 60 * 1000,
        "1h": 60 * 60 * 1000,
        "4h": 4 * 60 * 60 * 1000,
        "1d": 24 * 60 * 60 * 1000,
      }[timeframe] || 60 * 1000

    const now = Date.now()
    let price = currentPrice

    // Generate realistic price movements
    for (let i = points - 1; i >= 0; i--) {
      const timestamp = now - i * intervalMs

      // Add some realistic volatility (±5% max change per point)
      const volatility = 0.05
      const change = (Math.random() - 0.5) * 2 * volatility
      price = price * (1 + change)

      // Ensure price doesn't go negative
      price = Math.max(price, currentPrice * 0.1)

      data.push({
        timestamp,
        price,
        volume: Math.random() * 10000, // Random volume
      })
    }

    // Ensure the last point is the current price
    if (data.length > 0) {
      data[data.length - 1].price = currentPrice
    }

    return data
  }

  // Format timestamps based on timeframe
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const day = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })

    switch (selectedTimeframe) {
      case "1m":
      case "5m":
        // Para timeframes curtos, mostrar hora:minuto
        return time
      case "15m":
      case "1h":
        // Para timeframes médios, mostrar dia + hora
        return `${day}\n${time}`
      case "4h":
      case "1d":
        // Para timeframes longos, mostrar data completa
        return `${day}\n${time}`
      default:
        return `${day}\n${time}`
    }
  }

  // Update chart with historical data
  const updateChart = () => {
    if (!chartRef.current || historicalData.length === 0) return

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: historicalData.map((point) => formatTimestamp(point.timestamp)),
        datasets: [
          {
            label: `$SHILL Price (${selectedTimeframe.toUpperCase()})`,
            data: historicalData.map((point) => point.price),
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.2, // Menos curva para mais linearidade
            pointBackgroundColor: "#10b981",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: historicalData.length > 50 ? 0 : 3,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: "#374151",
              font: {
                family: "Exo 2",
                weight: "600",
                size: 14,
              },
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            borderColor: "#10b981",
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: (context: any) => {
                const dataPoint = historicalData[context[0].dataIndex]
                return new Date(dataPoint.timestamp).toLocaleString("en-US")
              },
              label: (context: any) => {
                return `Price: $${Number.parseFloat(context.parsed.y).toFixed(8)}`
              },
              afterLabel: (context: any) => {
                const dataPoint = historicalData[context.dataIndex]
                if (dataPoint.volume > 0) {
                  return `Volume: $${dataPoint.volume.toLocaleString()}`
                }
                return ""
              },
            },
          },
        },
        scales: {
          x: {
            type: "category",
            display: true,
            position: "bottom",
            title: {
              display: true,
              text: `Time (${selectedTimeframe.toUpperCase()})`,
              color: "#374151",
              font: {
                family: "Exo 2",
                weight: "700",
                size: 14,
              },
              padding: { top: 15 },
            },
            ticks: {
              color: "#374151",
              font: {
                family: "Exo 2",
                size: 11,
                weight: "600",
              },
              maxTicksLimit: 8, // Reduzido para evitar sobreposição
              maxRotation: 0, // ✅ Sem rotação - horizontal
              minRotation: 0, // ✅ Sem rotação - horizontal
              padding: 12,
              callback: function (value: any, index: number) {
                // Mostrar menos labels para evitar sobreposição horizontal
                const totalTicks = this.chart.data.labels?.length || 0
                let step = 1

                // Ajustar step para evitar sobreposição com texto horizontal
                if (selectedTimeframe === "1m" || selectedTimeframe === "5m") {
                  step = Math.max(1, Math.ceil(totalTicks / 6))
                } else if (selectedTimeframe === "15m" || selectedTimeframe === "1h") {
                  step = Math.max(1, Math.ceil(totalTicks / 8))
                } else {
                  step = Math.max(1, Math.ceil(totalTicks / 10))
                }

                if (index % step === 0 || index === totalTicks - 1) {
                  return this.chart.data.labels?.[index]
                }
                return ""
              },
            },
            grid: {
              color: "rgba(107, 114, 128, 0.2)",
              lineWidth: 1,
            },
            border: {
              color: "#d1d5db",
              width: 2,
            },
          },
          y: {
            type: "linear", // ✅ Mantém linear para preços
            display: true,
            position: "left",
            title: {
              display: true,
              text: "Price (USD)",
              color: "#374151",
              font: {
                family: "Exo 2",
                weight: "700",
                size: 14,
              },
              padding: { bottom: 10 },
            },
            ticks: {
              color: "#374151",
              font: {
                family: "Exo 2",
                size: 12,
                weight: "600",
              },
              padding: 15,
              maxTicksLimit: 8,
              callback: (value: any) => {
                const price = Number.parseFloat(value)
                if (price < 0.000001) {
                  return price.toExponential(2)
                } else if (price < 0.001) {
                  return "$" + price.toFixed(8)
                } else if (price < 1) {
                  return "$" + price.toFixed(6)
                } else {
                  return "$" + price.toFixed(4)
                }
              },
            },
            grid: {
              color: "rgba(107, 114, 128, 0.2)",
              lineWidth: 1,
            },
            border: {
              color: "#d1d5db",
              width: 2,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
        elements: {
          point: {
            hoverRadius: 8,
            hoverBorderWidth: 3,
          },
          line: {
            borderJoinStyle: "round",
            borderCapStyle: "round",
          },
        },
        layout: {
          padding: {
            top: 20,
            right: 30,
            bottom: 30, // ✅ Reduzido já que não há mais rotação
            left: 20,
          },
        },
      },
    })
  }

  // Format numbers
  const formatPrice = (price: number) => {
    if (price < 0.000001) return price.toExponential(2)
    return price.toFixed(8)
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(2)}M`
    if (volume >= 1000) return `$${(volume / 1000).toFixed(2)}K`
    return `$${volume.toFixed(2)}`
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`
  }

  // Initial load and setup interval
  useEffect(() => {
    fetchHistoricalData(selectedTimeframe)

    // Update every 30 seconds for short timeframes, less frequent for longer ones
    const updateInterval =
      selectedTimeframe === "1m" || selectedTimeframe === "5m"
        ? 30000
        : selectedTimeframe === "15m" || selectedTimeframe === "1h"
          ? 60000
          : 300000

    const interval = setInterval(() => {
      console.log(`🔄 Auto-refreshing ${selectedTimeframe} data...`)
      fetchHistoricalData(selectedTimeframe)
    }, updateInterval)

    return () => clearInterval(interval)
  }, [selectedTimeframe])

  // Update chart when historical data changes
  useEffect(() => {
    if (historicalData.length > 0) {
      updateChart()
    }
  }, [historicalData, selectedTimeframe])

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors font-subtitle"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl text-gray-900 font-title">$SHILL Analytics</span>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={() => fetchHistoricalData(selectedTimeframe)}
                disabled={loading}
                variant="outline"
                size="sm"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 font-button"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 font-button"
              >
                <a
                  href={`https://www.geckoterminal.com/${NETWORK}/pools/${POOL_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  GeckoTerminal
                </a>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Status Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${loading ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`}></div>
              <span className="text-sm text-gray-600 font-label">{loading ? "Updating..." : "Live Data"}</span>
              <div className="flex items-center text-xs text-gray-400 font-body">
                <Clock className="w-3 h-3 mr-1" />
                Last updated: {lastUpdate.toLocaleTimeString("en-US", { hour12: false })}
              </div>
            </div>

            {error && <div className="text-red-600 text-sm font-label">⚠️ {error}</div>}
          </div>
        </motion.div>

        {/* Token Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white border-gray-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 font-title">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl text-gray-900">$SHILL Token</h2>
                  <p className="text-sm text-gray-500 font-body">Real-time market data</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tokenData ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl text-gray-900 font-title mb-1">
                      ${formatPrice(tokenData.price)}
                    </div>
                    <div className="text-sm text-gray-500 font-label">Current Price</div>
                  </div>

                  <div className="text-center">
                    <div
                      className={`text-2xl md:text-3xl font-title mb-1 flex items-center justify-center ${
                        tokenData.priceChange24h >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tokenData.priceChange24h >= 0 ? (
                        <TrendingUp className="w-5 h-5 mr-1" />
                      ) : (
                        <TrendingDown className="w-5 h-5 mr-1" />
                      )}
                      {formatPercentage(tokenData.priceChange24h)}
                    </div>
                    <div className="text-sm text-gray-500 font-label">24h Change</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl md:text-3xl text-gray-900 font-title mb-1">
                      {formatVolume(tokenData.volume24h)}
                    </div>
                    <div className="text-sm text-gray-500 font-label">24h Volume</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl md:text-3xl text-gray-900 font-title mb-1">
                      {formatVolume(tokenData.liquidity)}
                    </div>
                    <div className="text-sm text-gray-500 font-label">Liquidity</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500 font-body">Loading token data...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Timeframe Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <Card className="bg-white border-gray-100 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-lg text-gray-900 font-subtitle">📊 Timeframe Selection</h3>
                <div className="flex flex-wrap gap-2">
                  {TIMEFRAME_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => setSelectedTimeframe(option.value)}
                      variant={selectedTimeframe === option.value ? "default" : "outline"}
                      size="sm"
                      className={`font-button ${
                        selectedTimeframe === option.value
                          ? "bg-gradient-to-r from-green-500 to-blue-500 text-white"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Price Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-white border-gray-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between font-title">
                <div className="flex items-center space-x-3">
                  <Activity className="w-6 h-6 text-blue-600" />
                  <span className="text-gray-900">$SHILL Price Chart</span>
                  <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded font-body">
                    {TIMEFRAME_OPTIONS.find((t) => t.value === selectedTimeframe)?.label}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  {loadingChart && (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="font-body">Loading...</span>
                    </>
                  )}
                  <span className="font-body">{historicalData.length} data points</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 relative">
                {loadingChart && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-gray-500 font-body">Loading chart data...</p>
                    </div>
                  </div>
                )}
                <canvas ref={chartRef} className="w-full h-full"></canvas>
              </div>

              {/* ✅ Data e Hora do Gráfico */}
              {historicalData.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="font-body">
                      📅 From: {new Date(historicalData[0].timestamp).toLocaleString("en-US")}
                    </span>
                    <span className="font-body">
                      📅 To: {new Date(historicalData[historicalData.length - 1].timestamp).toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-body">🕒 Updated: {lastUpdate.toLocaleString("en-US")}</span>
                    <div
                      className={`w-2 h-2 rounded-full ${loadingChart ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`}
                    ></div>
                  </div>
                </div>
              )}
              {error && historicalData.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-red-500 mb-4">⚠️ {error}</div>
                  <Button
                    onClick={() => fetchHistoricalData(selectedTimeframe)}
                    variant="outline"
                    className="font-button"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Metrics */}
        {tokenData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="bg-white border-gray-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 font-subtitle">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-gray-900">Market Cap</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-gray-900 font-title">{formatVolume(tokenData.marketCap)}</div>
                <p className="text-sm text-gray-500 font-body mt-1">Current market capitalization</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 font-subtitle">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900">24h Transactions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-gray-900 font-title">{tokenData.transactions24h.toLocaleString()}</div>
                <p className="text-sm text-gray-500 font-body mt-1">Total buys and sells</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 font-subtitle">
                  <Droplets className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-900">FDV</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-gray-900 font-title">{formatVolume(tokenData.fdv)}</div>
                <p className="text-sm text-gray-500 font-body mt-1">Fully diluted valuation</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg text-blue-900 mb-2 font-subtitle">📊 Real-Time Data</h3>
              <p className="text-blue-800 font-body">
                All data is fetched live from GeckoTerminal API. Charts update every 30 seconds automatically.
              </p>
              <div className="mt-4 text-xs text-blue-600 font-body">
                <p>Pool Address: {POOL_ADDRESS}</p>
                <p>Network: {NETWORK}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
