"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  RefreshCw,
  DollarSign,
  Activity,
  Droplets,
  Copy,
  ArrowLeft,
  BarChart3,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

interface TokenData {
  id: string
  name: string
  address: string
  volume_usd: number
  liquidity_usd: number
  base_token_price: number
  quote_token_price: number
  price_change_24h: number
  market_cap_usd: number
  fdv_usd: number
  base_token_symbol: string
  quote_token_symbol: string
  main_token_symbol: string
  wpepu_token_symbol: string
  pool_created_at: string
  transactions_24h: any
  is_wpepu_pair: boolean
}

interface ApiResponse {
  success: boolean
  data?: TokenData[]
  error?: string
  timestamp: string
  source: string
  filter?: string
  total_found?: number
  debug_info?: {
    total_pools: number
    parsing_method: string
    sample_parsing: Array<{
      original: string
      parsed: string
      is_wpepu: boolean
    }>
  }
}

export default function Top10Page() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [copied, setCopied] = useState<string>("")
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const fetchTopTokens = async () => {
    try {
      setLoading(true)
      setError("")

      console.log("🔍 Fetching top 5 WPEPU pairs...")
      const response = await fetch("/api/top-tokens")
      const data: ApiResponse = await response.json()

      console.log("📊 API Response:", data)

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch data")
      }

      // Data is already filtered and sorted by the API
      setTokens(data.data || [])
      setLastUpdated(data.timestamp)
      setDebugInfo(data.debug_info)
    } catch (err: any) {
      console.error("❌ Error:", err)
      setError(err.message || "Failed to load top 5 WPEPU pairs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTopTokens()

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchTopTokens, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number, decimals = 2) => {
    if (num === 0) return "$0"
    if (num < 0.01) return `$${num.toFixed(6)}`
    if (num < 1000) return `$${num.toFixed(decimals)}`
    if (num < 1000000) return `$${(num / 1000).toFixed(1)}K`
    if (num < 1000000000) return `$${(num / 1000000).toFixed(1)}M`
    return `$${(num / 1000000000).toFixed(1)}B`
  }

  const formatPercentage = (num: number) => {
    if (num === 0) return "0%"
    const sign = num > 0 ? "+" : ""
    return `${sign}${num.toFixed(2)}%`
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(""), 2000)
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return "🥇"
      case 1:
        return "🥈"
      case 2:
        return "🥉"
      default:
        return `#${index + 1}`
    }
  }

  const getGeckoTerminalUrl = (poolId: string) => {
    return `https://www.geckoterminal.com/pt/pepe-unchained/pools/${poolId}`
  }

  const getSortingMetric = (token: TokenData) => {
    if (token.market_cap_usd > 0) {
      return { value: token.market_cap_usd, label: "Market Cap" }
    }
    if (token.fdv_usd > 0) {
      return { value: token.fdv_usd, label: "FDV" }
    }
    return { value: token.liquidity_usd, label: "Liquidity" }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-title text-gray-900 mb-2">Loading TOP 5 WPEPU Pairs</h2>
          <p className="text-gray-600 font-description">Parsing pool names and filtering unique tokens...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-title text-gray-900 mb-4">Error Loading Data</h2>
          <p className="text-gray-600 font-description mb-6">{error}</p>
          <Button onClick={fetchTopTokens} className="bg-blue-500 hover:bg-blue-600 text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (tokens.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-2xl font-title text-gray-900 flex items-center">
                  <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
                  TOP 5 WPEPU Pairs
                </h1>
              </div>
              <Button
                onClick={fetchTopTokens}
                disabled={loading}
                variant="outline"
                size="sm"
                className="bg-transparent"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-2xl mx-auto p-8">
              <div className="text-6xl mb-4">🔧</div>
              <h2 className="text-2xl font-title text-gray-900 mb-4">Parsing Pool Names</h2>
              <p className="text-gray-600 font-description mb-6">
                Extracting unique WPEPU pairs and filtering out duplicates and stablecoins...
              </p>

              {/* Enhanced Debug Information */}
              {debugInfo && (
                <Card className="bg-white/80 backdrop-blur-sm border-gray-200 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <AlertCircle className="w-5 h-5 text-blue-500 mr-2" />
                      <h3 className="text-lg font-subtitle text-gray-900">Pool Name Parsing Analysis</h3>
                    </div>
                    <div className="text-left space-y-4 text-sm">
                      <div>
                        <strong>Total pools found:</strong> {debugInfo.total_pools}
                      </div>
                      <div>
                        <strong>Parsing method:</strong> {debugInfo.parsing_method}
                      </div>

                      <div>
                        <strong>Sample parsing results:</strong>
                        <div className="bg-gray-50 p-3 rounded text-xs mt-2 space-y-2 max-h-60 overflow-y-auto">
                          {debugInfo.sample_parsing?.map((item: any, index: number) => (
                            <div
                              key={index}
                              className={`p-2 rounded ${item.is_wpepu ? "bg-green-100 border border-green-300" : "bg-gray-100"}`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div>
                                    <strong>Original:</strong> {item.original}
                                  </div>
                                  <div>
                                    <strong>Parsed:</strong> {item.parsed}
                                  </div>
                                </div>
                                <div>
                                  {item.is_wpepu ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <div className="w-4 h-4"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )) || "No parsing data available"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                <Button onClick={fetchTopTokens} className="bg-blue-500 hover:bg-blue-600 text-white">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh & Re-parse
                </Button>
                <div className="text-sm text-gray-500">
                  <p>Filtering out:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Duplicate tokens (keeping only first occurrence)</li>
                    <li>Stablecoins (USDT, USDC, etc.)</li>
                    <li>Wrapped tokens (WETH)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-title text-gray-900 flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
                TOP 5 WPEPU Pairs
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 font-label">
                Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "Never"}
              </div>
              <Button
                onClick={fetchTopTokens}
                disabled={loading}
                variant="outline"
                size="sm"
                className="bg-transparent"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 mb-8 border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-subtitle text-gray-900 mb-2 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Top 5 Unique WPEPU Trading Pairs
              </h2>
              <p className="text-gray-600 font-description">
                The highest market cap tokens paired with WPEPU (Wrapped PEPU), filtered to remove duplicates and
                stablecoins
              </p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 mb-2">
                Unique Pairs Only
              </Badge>
              <p className="text-sm text-gray-500 font-label">No duplicates or stablecoins</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-label">Unique WPEPU Pairs</p>
                  <p className="text-2xl font-title text-gray-900">{tokens.length}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-label">Total Market Cap</p>
                  <p className="text-2xl font-title text-gray-900">
                    {formatNumber(tokens.reduce((sum, token) => sum + token.market_cap_usd, 0))}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-label">Total Volume (24h)</p>
                  <p className="text-2xl font-title text-gray-900">
                    {formatNumber(tokens.reduce((sum, token) => sum + token.volume_usd, 0))}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-label">Total Liquidity</p>
                  <p className="text-2xl font-title text-gray-900">
                    {formatNumber(tokens.reduce((sum, token) => sum + token.liquidity_usd, 0))}
                  </p>
                </div>
                <Droplets className="w-8 h-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tokens List */}
        <div className="space-y-4">
          {tokens.map((token, index) => {
            const sortingMetric = getSortingMetric(token)

            return (
              <motion.div
                key={token.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                      {/* Rank & Name */}
                      <div className="lg:col-span-3 flex items-center space-x-4">
                        <div className="text-2xl font-title">{getRankIcon(index)}</div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                          <span className="text-purple-600 font-bold text-lg">{token.main_token_symbol.charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-subtitle text-gray-900 flex items-center space-x-2">
                            <span className="font-bold">{token.main_token_symbol}</span>
                            <span className="text-gray-400">/</span>
                            <span className="text-purple-600 font-bold">WPEPU</span>
                          </h3>
                          <p className="text-sm text-gray-600 font-description truncate">{token.name}</p>
                        </div>
                      </div>

                      {/* Sorting Metric (Market Cap/FDV/Liquidity) */}
                      <div className="lg:col-span-2">
                        <p className="text-sm text-gray-600 font-label">{sortingMetric.label}</p>
                        <p className="text-lg font-title text-purple-600 font-bold">
                          {formatNumber(sortingMetric.value)}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="lg:col-span-2">
                        <p className="text-sm text-gray-600 font-label">Price</p>
                        <p className="text-lg font-title text-gray-900">{formatNumber(token.base_token_price, 6)}</p>
                      </div>

                      {/* 24h Change */}
                      <div className="lg:col-span-2">
                        <p className="text-sm text-gray-600 font-label">24h Change</p>
                        <div
                          className={`flex items-center space-x-1 ${
                            token.price_change_24h >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {token.price_change_24h >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="font-title">{formatPercentage(token.price_change_24h)}</span>
                        </div>
                      </div>

                      {/* Volume */}
                      <div className="lg:col-span-2">
                        <p className="text-sm text-gray-600 font-label">Volume (24h)</p>
                        <p className="text-lg font-title text-gray-900">{formatNumber(token.volume_usd)}</p>
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-1 flex items-center space-x-2">
                        <Button
                          onClick={() => copyToClipboard(token.address, token.id)}
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          title="Copy pool address"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button asChild variant="ghost" size="sm" className="p-2">
                          <a
                            href={getGeckoTerminalUrl(token.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on GeckoTerminal"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </div>

                    {/* Additional Metrics */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-3 gap-4">
                        {token.market_cap_usd > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 font-label">Market Cap</p>
                            <p className="text-lg font-title text-gray-900">{formatNumber(token.market_cap_usd)}</p>
                          </div>
                        )}
                        {token.fdv_usd > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 font-label">FDV</p>
                            <p className="text-lg font-title text-gray-900">{formatNumber(token.fdv_usd)}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-600 font-label">Liquidity</p>
                          <p className="text-lg font-title text-gray-900">{formatNumber(token.liquidity_usd)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Pool Address */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-label">Pool Address</p>
                          <p className="text-sm font-mono text-gray-900 break-all">{token.address}</p>
                        </div>
                        {copied === token.id && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Copied!
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-lg font-subtitle text-gray-900 mb-2 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Top 5 Unique WPEPU Pairs
              </h3>
              <p className="text-gray-600 font-description mb-4">
                Showing the top 5 highest market cap tokens paired with WPEPU (Wrapped PEPU) on PEPU Unchained V2.
                Duplicates and stablecoins (USDT, WETH, etc.) have been filtered out. Rankings prioritize market cap,
                then FDV, then liquidity (TVL).
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span>Auto-refresh: 5 minutes</span>
                <span>•</span>
                <span>Filter: Unique WPEPU pairs</span>
                <span>•</span>
                <span>Excludes: Stablecoins & duplicates</span>
              </div>
              <div className="mt-4">
                <a
                  href="https://www.geckoterminal.com/pt/pepe-unchained/pools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center justify-center"
                >
                  View all pools on GeckoTerminal <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
