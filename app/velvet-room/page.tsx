"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Wallet, Shield, ExternalLink, CheckCircle, XCircle, RefreshCw, Crown } from "lucide-react"
import Link from "next/link"

const SHILL_CONTRACT_ADDRESS = "0x43Ab9afcEca24cFc1E0F9221d6C8775a090FE340"
const MINIMUM_SHILL_BALANCE = 10000000 // 10 million tokens
const PEPU_V2_RPC = "https://rpc-pepu-v2-mainnet-0.t.conduit.xyz/"
const PEPU_V2_EXPLORER = "https://pepuscan.com"
const WHITELISTED_ADDRESSES = [
  "0x6546bb5c7a5C9072559ec49Cc9F9D9aBdb580754",
  "0xf23F829eb7F710C07253A7FA4E2FCF0a5E06726d", // Adicionado o novo endereço whitelisted
]

interface WalletState {
  address: string | null
  isConnected: boolean
  shillBalance: number
  hasAccess: boolean
  isLoading: boolean
}

export default function VelvetRoomPage() {
  const [mounted, setMounted] = useState(false)
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    shillBalance: 0,
    hasAccess: false,
    isLoading: false,
  })
  const [error, setError] = useState<string>("")
  const [telegramHandle, setTelegramHandle] = useState("")
  const [telegramUserId, setTelegramUserId] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const initializeWallet = async () => {
      await checkWalletConnection()
    }
    initializeWallet()
  }, [mounted])

  const checkWalletConnection = async () => {
    try {
      if (typeof window === "undefined") return
      if (!window.ethereum) return

      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (accounts && accounts.length > 0) {
        const address = accounts[0]
        setWallet((prev) => ({ ...prev, address, isConnected: true }))
        await checkShillBalance(address)
      }
    } catch (err) {
      console.error("Error checking wallet connection:", err)
    }
  }

  const connectWallet = async () => {
    try {
      setError("")
      setWallet((prev) => ({ ...prev, isLoading: true }))

      if (typeof window === "undefined") {
        throw new Error("Window not available")
      }

      if (!window.ethereum) {
        throw new Error("No wallet detected. Please install MetaMask, Coinbase Wallet, or another Web3 wallet.")
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found")
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
      setError(err.message || "Failed to connect wallet")
      setWallet((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const checkShillBalance = async (address: string) => {
    try {
      console.log("Checking SHILL balance for Velvet Room...")

      // ✅ Lógica para endereço whitelisted
      if (WHITELISTED_ADDRESSES.map((a) => a.toLowerCase()).includes(address.toLowerCase())) {
        console.log("Whitelisted address detected. Granting access to Velvet Room.")
        setWallet((prev) => ({
          ...prev,
          shillBalance: MINIMUM_SHILL_BALANCE, // Simula o saldo para mostrar acesso
          hasAccess: true,
          isLoading: false,
        }))
        return
      }

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
        throw new Error(`HTTP ${response.status}`)
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

      console.log("SHILL Balance:", balance.toLocaleString())
      console.log("Access:", hasAccess ? "GRANTED" : "DENIED")
    } catch (err: any) {
      console.error("Error checking SHILL balance:", err)
      setError("Failed to check SHILL balance")
      setWallet((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const formatTokens = (amount: number) => {
    return new Intl.NumberFormat("en-US").format(Math.floor(amount))
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const saveVerifiedUser = async () => {
    if (!telegramHandle.trim()) {
      setError("Please enter your Telegram handle")
      return
    }

    if (!telegramUserId.trim()) {
      setError("Please enter your Telegram User ID")
      return
    }

    try {
      setIsSaving(true)
      setError("")

      console.log("Saving verified user:", {
        walletAddress: wallet.address,
        telegramHandle: telegramHandle.trim(),
        telegramUserId: telegramUserId.trim(),
        shillBalance: wallet.shillBalance,
      })

      const response = await fetch("/api/save-verified", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: wallet.address,
          telegramHandle: telegramHandle.trim(),
          telegramUserId: telegramUserId.trim(),
          shillBalance: wallet.shillBalance,
          timestamp: new Date().toISOString(),
        }),
      })

      const result = await response.json()
      console.log("Save response:", result)

      if (!response.ok) {
        throw new Error(result.error || "Failed to save verification")
      }

      setSaveSuccess(true)
      setIsSaving(false)
      console.log("User verification saved successfully!")
    } catch (err: any) {
      console.error("Error saving verification:", err)
      setError(err.message || "Failed to save verification")
      setIsSaving(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

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
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 uppercase">Velvet Room</span>
            </div>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
        <Card className="bg-white border-gray-100 shadow-xl max-w-md w-full">
          <CardContent className="p-8 text-center space-y-6">
            {wallet.isConnected ? (
              <>
                <div
                  className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
                    wallet.hasAccess
                      ? "bg-gradient-to-br from-green-500 to-blue-600"
                      : "bg-gradient-to-br from-red-500 to-orange-500"
                  }`}
                >
                  {wallet.hasAccess ? (
                    <CheckCircle className="w-10 h-10 text-white" />
                  ) : (
                    <XCircle className="w-10 h-10 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {wallet.hasAccess ? "Access Granted!" : "Access Denied"}
                  </h1>
                  <p className="text-gray-600 mb-4">
                    {wallet.hasAccess
                      ? "Welcome to the exclusive Velvet Room."
                      : `You need at least ${formatTokens(
                          MINIMUM_SHILL_BALANCE,
                        )} $SHILL tokens to enter the Velvet Room.`}
                  </p>
                  <p className="text-sm text-gray-500">
                    Your Wallet: <strong>{formatAddress(wallet.address!)}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    Your $SHILL Balance: <strong>{formatTokens(wallet.shillBalance)} $SHILL</strong>
                  </p>
                </div>
                {wallet.hasAccess ? (
                  <div className="space-y-4">
                    {!saveSuccess ? (
                      <>
                        <div className="space-y-3">
                          <label htmlFor="telegram" className="block text-sm font-medium text-gray-700">
                            Enter your Telegram handle
                          </label>
                          <input
                            id="telegram"
                            type="text"
                            placeholder="@yourusername"
                            value={telegramHandle}
                            onChange={(e) => setTelegramHandle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="space-y-3">
                          <label htmlFor="telegramId" className="block text-sm font-medium text-gray-700">
                            Enter your Telegram User ID
                          </label>
                          <input
                            id="telegramId"
                            type="text"
                            placeholder="123456789"
                            value={telegramUserId}
                            onChange={(e) => setTelegramUserId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <p className="text-xs text-gray-500">
                            To get your Telegram ID, message @userinfobot on Telegram
                          </p>
                        </div>
                        <Button
                          onClick={saveVerifiedUser}
                          disabled={isSaving || !telegramHandle.trim() || !telegramUserId.trim()}
                          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-0 shadow-lg"
                        >
                          {isSaving ? "Saving..." : "Save & Continue"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-800 font-medium">✅ Verification saved successfully!</p>
                          <p className="text-green-600 text-sm mt-1">
                            Handle: {telegramHandle} | ID: {telegramUserId}
                          </p>
                        </div>
                        <Button
                          asChild
                          className="w-full bg-gradient-to-r from-blue-800 to-cyan-500 hover:from-blue-900 hover:to-cyan-600 text-white border-0 shadow-lg"
                        >
                          <Link href="/portfolio-tracker">
                            <Shield className="w-5 h-5 mr-2" />
                            Go to Portfolio Tracker
                          </Link>
                        </Button>
                        <Button
                          asChild
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white border-0 shadow-lg"
                        >
                          <a href="https://t.me/+oqg9MPEpzg8wNDFh" target="_blank" rel="noopener noreferrer">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                            </svg>
                            Join VIP Telegram
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
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
                    <Button
                      onClick={() => checkShillBalance(wallet.address!)}
                      disabled={wallet.isLoading}
                      variant="outline"
                      className="w-full bg-transparent border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${wallet.isLoading ? "animate-spin" : ""}`} />
                      Refresh Balance
                    </Button>
                  </div>
                )}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Velvet Room</h1>
                  <p className="text-gray-600">Connect your wallet to check your access status.</p>
                </div>
                <Button
                  onClick={connectWallet}
                  disabled={wallet.isLoading}
                  className="w-full bg-gradient-to-r from-purple-800 to-pink-500 hover:from-purple-900 hover:to-pink-600 text-white border-0 shadow-lg"
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

declare global {
  interface Window {
    ethereum?: any
  }
}
