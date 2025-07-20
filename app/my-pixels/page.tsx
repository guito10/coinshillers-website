"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Wallet, Crown, Shield, ExternalLink, RefreshCw, AlertCircle } from "lucide-react"
import Link from "next/link"

const SHILL_CONTRACT_ADDRESS = "0x43Ab9afcEca24cFc1E0F9221d6C8775a090FE340"
const MINIMUM_SHILL_BALANCE = 10000000 // 10 million tokens
const PEPU_V2_RPC = "https://rpc-pepu-v2-mainnet-0.t.conduit.xyz/"
const PEPU_V2_EXPLORER = "https://explorer-pepe-unchained-gupg0lo9wf.t.conduit.xyz"

interface WalletState {
  address: string | null
  isConnected: boolean
  shillBalance: number
  hasAccess: boolean
  isLoading: boolean
}

export default function MyPixelsPage() {
  const [mounted, setMounted] = useState(false)
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    shillBalance: 0,
    hasAccess: false,
    isLoading: false,
  })
  const [error, setError] = useState<string>("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const initializeWallet = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500)) // Small delay for window.ethereum
        await checkWalletConnection()
      } catch (err) {
        console.error("Error initializing wallet:", err)
        setError("Failed to initialize wallet. Please refresh.")
      }
    }
    initializeWallet()
  }, [mounted])

  const checkWalletConnection = async () => {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        return // Do nothing if window or ethereum is not available
      }

      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (accounts && accounts.length > 0) {
        const address = accounts[0]
        setWallet((prev) => ({ ...prev, address, isConnected: true }))
        await checkShillBalance(address)
      }
    } catch (err) {
      console.error("Error checking connection:", err)
      // Do not set global error here, as it might be a transient issue
    }
  }

  const connectWallet = async () => {
    try {
      setError("")
      setWallet((prev) => ({ ...prev, isLoading: true }))

      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("No Web3 wallet detected. Please install MetaMask or similar.")
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts connected.")
      }

      const address = accounts[0]
      setWallet((prev) => ({
        ...prev,
        address,
        isConnected: true,
      }))

      await checkShillBalance(address)
    } catch (err: any) {
      console.error("Error connecting wallet:", err)
      setError(err.message || "Failed to connect wallet.")
      setWallet((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const checkShillBalance = async (address: string) => {
    try {
      console.log("🔍 Checking SHILL balance for My Pixels...")

      const paddedAddress = address.slice(2).padStart(64, "0")
      const callData = `0x70a08231${paddedAddress}`

      const response = await fetch(PEPU_V2_RPC, {
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
              data: callData,
            },
            "latest",
          ],
          id: 1,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.message)
      }

      let balance = 0
      if (data.result && data.result !== "0x" && data.result !== "0x0") {
        const balanceWei = Number.parseInt(data.result, 16)
        balance = balanceWei / Math.pow(10, 18)
      }

      const hasAccess = balance >= MINIMUM_SHILL_BALANCE

      setWallet((prev) => ({
        ...prev,
        shillBalance: balance,
        hasAccess,
        isLoading: false,
      }))

      console.log("💰 SHILL Balance (My Pixels):", balance.toLocaleString())
      console.log("🎯 Access (My Pixels):", hasAccess ? "✅ GRANTED" : "❌ DENIED")
    } catch (err: any) {
      console.error("❌ Error checking SHILL balance for My Pixels:", err)
      setError("Failed to check SHILL balance for access.")
      setWallet((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const formatTokens = (amount: number) => {
    return new Intl.NumberFormat("en-US").format(Math.floor(amount))
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading My Pixels...</p>
        </div>
      </div>
    )
  }

  // Access Control - Wallet not connected
  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors uppercase font-bold"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 uppercase">My Pixels</span>
              </div>
            </nav>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
          <Card className="bg-white border-gray-100 shadow-xl max-w-md w-full">
            <CardContent className="p-8 text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">My Pixels</h1>
                <p className="text-gray-600">Connect your wallet to view your purchased pixels.</p>
              </div>
              <Button
                onClick={connectWallet}
                disabled={wallet.isLoading}
                className="w-full bg-gradient-to-r from-blue-800 to-cyan-500 hover:from-blue-900 hover:to-cyan-600 text-white border-0 shadow-lg"
                size="lg"
              >
                <Wallet className="w-5 h-5 mr-2" />
                {wallet.isLoading ? "CONNECTING..." : "CONNECT WALLET"}
              </Button>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Access Control - No VIP access
  if (!wallet.hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors uppercase font-bold"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 uppercase">Access Denied</span>
              </div>
            </nav>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
          <Card className="bg-white border-gray-100 shadow-xl max-w-md w-full">
            <CardContent className="p-8 text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">VIP Access Required</h1>
                <p className="text-gray-600 mb-4">
                  You need at least <strong>{formatTokens(MINIMUM_SHILL_BALANCE)} $SHILL tokens</strong> to access the
                  My Pixels page.
                </p>
                <p className="text-sm text-gray-500">
                  Current balance: <strong>{formatTokens(wallet.shillBalance)} $SHILL</strong>
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-blue-800 to-cyan-500 hover:from-blue-900 hover:to-cyan-600 text-white border-0 shadow-lg"
                >
                  <a
                    href={`${PEPU_V2_EXPLORER}/token/${SHILL_CONTRACT_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    💰 Buy $SHILL Tokens
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/velvet-room">Access Velvet Room</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main My Pixels Interface (VIP Access Granted)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors uppercase font-bold"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 uppercase">My Pixels</span>
              <Crown className="w-6 h-6 text-yellow-500" />
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-600">Connected:</p>
              <p className="text-xs text-green-600">{formatTokens(wallet.shillBalance)} $SHILL</p>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Purchased Pixels</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This is where your unique digital assets (pixels) will be displayed. Please tell me how you envision these
            pixels to be represented!
          </p>
        </motion.div>

        {/* Placeholder for Pixel Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border-gray-100 shadow-lg rounded-xl p-8 min-h-[400px] flex items-center justify-center"
        >
          <div className="text-center text-gray-500">
            <p className="text-xl mb-4">🎨 Pixel Grid Coming Soon!</p>
            <p>Once you describe how your pixels should look and behave, I'll implement them here.</p>
            <p className="mt-4">Example: A grid of colored squares, each representing a unique asset.</p>
          </div>
        </motion.div>

        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">{error}</div>
        )}
      </div>
    </div>
  )
}

declare global {
  interface Window {
    ethereum?: any
  }
}
