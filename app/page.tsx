"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Wallet,
  ExternalLink,
  Rocket,
  Users,
  Shield,
  TrendingUp,
  Network,
  Sparkles,
  ChevronDown,
  Smartphone,
  X,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Contract and network configurations
const SHILL_CONTRACT_ADDRESS = "0x43ab9afceca24cfc1e0f9221d6c8775a090fe340"
const PEPU_L1_CONTRACT_ADDRESS = "0x93aA0ccD1e5628d3A841C4DbdF602D9eb04085d6"
const PUMPPAD_LINK = "https://pumppad.gg/0x43ab9afceca24cfc1e0f9221d6c8775a090fe340"
const GECKO_TERMINAL_LINK =
  "https://www.geckoterminal.com/pt/pepe-unchained/pools/0xff574fe456909cff10ad02ac78f49702313e0590"

// ✅ OFFICIAL SOCIAL MEDIA LINKS
const SOCIAL_LINKS = {
  twitter: "https://x.com/coinshillers",
  telegram: "https://t.me/ShillGuys4PEPU",
  website: "https://coinshillers.com",
}

const ETHEREUM_CONFIG = {
  chainId: "0x1", // 1 in hex (Ethereum Mainnet)
  chainName: "Ethereum Mainnet",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://mainnet.infura.io/v3/", "https://eth-mainnet.alchemyapi.io/v2/"],
  blockExplorerUrls: ["https://etherscan.io/"],
}

// ✅ CONFIGURAÇÃO CORRETA DA NOVA PEPU V2:
const PEPU_V2_NETWORK_CONFIG = {
  chainId: "0xd51", // 3409 in hex (PEPU V2)
  chainName: "Pepe Unchained",
  nativeCurrency: {
    name: "Pepe Unchained",
    symbol: "PEPU",
    decimals: 18,
  },
  rpcUrls: ["https://rpc-pepu-v2-mainnet-0.t.conduit.xyz/"],
  blockExplorerUrls: ["https://explorer-pepe-unchained-gupg0lo9wf.t.conduit.xyz/"],
}

interface WalletState {
  address: string | null
  isConnected: boolean
  shillBalance: number
  pepuL1Balance: number
  pepuV2Balance: number
  totalPepuBalance: number
  isLoading: boolean
  connectedWallet: string | null
}

declare global {
  interface Window {
    ethereum?: any
  }
}

export default function HomePage() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    shillBalance: 0,
    pepuL1Balance: 0,
    pepuV2Balance: 0,
    totalPepuBalance: 0,
    isLoading: false,
    connectedWallet: null,
  })
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string>("")
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // ✅ Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth <= 768 ||
          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      )
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // ✅ Opções de carteira otimizadas para mobile
  const walletOptions = [
    {
      name: "MetaMask",
      icon: "🦊",
      id: "metamask",
      description: "Connect with MetaMask",
      mobileDeepLink: "https://metamask.app.link/dapp/coinshillers.com",
      downloadLink: "https://metamask.io/download/",
    },
    {
      name: "Trust Wallet",
      icon: "🛡️",
      id: "trust",
      description: "Connect with Trust Wallet",
      mobileDeepLink: "https://link.trustwallet.com/open_url?coin_id=60&url=https://coinshillers.com",
      downloadLink: "https://trustwallet.com/download",
    },
    {
      name: "Coinbase Wallet",
      icon: "🔵",
      id: "coinbase",
      description: "Connect with Coinbase Wallet",
      mobileDeepLink: "https://go.cb-w.com/dapp?cb_url=https://coinshillers.com",
      downloadLink: "https://www.coinbase.com/wallet/downloads",
    },
    {
      name: "WalletConnect",
      icon: "🔗",
      id: "walletconnect",
      description: "Connect with any wallet",
      mobileDeepLink: null,
      downloadLink: null,
    },
  ]

  // ✅ Conectar carteira otimizado para mobile
  const connectWallet = async (walletType: string) => {
    try {
      setError("")
      setWallet((prev) => ({ ...prev, isLoading: true }))
      setShowWalletModal(false)

      // ✅ LÓGICA ESPECÍFICA PARA MOBILE
      if (isMobile) {
        console.log("📱 Mobile detected - Using mobile wallet connection")

        // Se não tem ethereum no mobile, tentar deep link
        if (!window.ethereum) {
          const selectedWallet = walletOptions.find((w) => w.id === walletType)

          if (selectedWallet?.mobileDeepLink) {
            console.log("🔗 Opening wallet via deep link:", selectedWallet.mobileDeepLink)
            window.location.href = selectedWallet.mobileDeepLink
            return
          } else if (selectedWallet?.downloadLink) {
            console.log("📥 Redirecting to wallet download:", selectedWallet.downloadLink)
            window.open(selectedWallet.downloadLink, "_blank")
            return
          }

          throw new Error(`Please install ${selectedWallet?.name || "a Web3 wallet"} mobile app first.`)
        }

        // Para mobile com ethereum disponível
        let provider = window.ethereum

        // Tentar detectar a carteira específica no mobile
        if (walletType === "metamask" && window.ethereum.isMetaMask) {
          provider = window.ethereum
        } else if (walletType === "trust" && window.ethereum.isTrust) {
          provider = window.ethereum
        } else if (walletType === "coinbase" && window.ethereum.isCoinbaseWallet) {
          provider = window.ethereum
        }

        console.log("📱 Using mobile provider:", provider)

        const accounts = await provider.request({
          method: "eth_requestAccounts",
        })

        if (accounts.length === 0) {
          throw new Error("No accounts connected")
        }

        const address = accounts[0]
        setWallet((prev) => ({
          ...prev,
          address,
          isConnected: true,
          connectedWallet: walletType,
        }))

        await checkAllBalances(address)
        return
      }

      // ✅ LÓGICA PARA DESKTOP (mantida igual)
      if (!window.ethereum) {
        throw new Error("No Web3 wallet found. Please install MetaMask, Coinbase Wallet, or Trust Wallet.")
      }

      let provider = window.ethereum

      if (walletType === "metamask" && window.ethereum.providers) {
        provider = window.ethereum.providers.find((p: any) => p.isMetaMask) || window.ethereum
      } else if (walletType === "coinbase" && window.ethereum.providers) {
        provider = window.ethereum.providers.find((p: any) => p.isCoinbaseWallet) || window.ethereum
      } else if (walletType === "trust" && window.ethereum.providers) {
        provider = window.ethereum.providers.find((p: any) => p.isTrust) || window.ethereum
      }

      if (!provider) {
        provider = window.ethereum
      }

      const accounts = await provider.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length === 0) {
        throw new Error("No accounts connected")
      }

      const address = accounts[0]
      setWallet((prev) => ({
        ...prev,
        address,
        isConnected: true,
        connectedWallet: walletType,
      }))

      await checkAllBalances(address)
    } catch (err: any) {
      console.error("❌ Wallet connection error:", err)
      setError(err.message || "Error connecting wallet")
      setWallet((prev) => ({ ...prev, isLoading: false }))
    }
  }

  // Check PEPU balance on Ethereum L1
  const checkPepuBalanceL1 = async (address: string): Promise<number> => {
    try {
      console.log("🔍 Checking PEPU on Ethereum L1 via RPC...")

      const response = await fetch("https://eth-mainnet.alchemyapi.io/v2/demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [
            {
              to: PEPU_L1_CONTRACT_ADDRESS,
              data: `0x70a08231000000000000000000000000${address.slice(2)}`,
            },
            "latest",
          ],
          id: 1,
        }),
      })

      const data = await response.json()
      console.log("📊 Raw PEPU L1 balance data:", data)

      if (!data.result || data.result === "0x" || data.result === "0x0") {
        console.log("⚠️ No PEPU L1 balance data received")
        return 0
      }

      const balanceWei = Number.parseInt(data.result, 16)
      if (isNaN(balanceWei)) {
        console.log("⚠️ Invalid PEPU L1 balance data:", data.result)
        return 0
      }

      const balance = balanceWei / Math.pow(10, 18)
      console.log("💰 PEPU L1 Balance:", balance)
      return balance
    } catch (err: any) {
      console.error("❌ Error checking PEPU L1 balance:", err)
      return 0
    }
  }

  // ✅ Check native PEPU balance on PEPU V2 (NOVA REDE)
  const checkPepuBalanceV2 = async (address: string): Promise<number> => {
    try {
      console.log("🔍 === CHECKING PEPU V2 BALANCE (NOVA REDE) ===")
      console.log("📍 Address:", address)
      console.log("🌐 Network: PEPU V2 (Chain ID: 3409)")
      console.log("🔗 RPC: https://rpc-pepu-v2-mainnet-0.t.conduit.xyz/")

      const requestBody = {
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1,
      }
      console.log("📤 Request body:", JSON.stringify(requestBody, null, 2))

      const response = await fetch("https://rpc-pepu-v2-mainnet-0.t.conduit.xyz/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("📊 Raw PEPU V2 response:", JSON.stringify(data, null, 2))

      if (data.error) {
        console.error("❌ RPC Error:", data.error)
        throw new Error(`RPC Error: ${data.error.message}`)
      }

      if (!data.result) {
        console.log("⚠️ No result in response")
        return 0
      }

      if (data.result === "0x" || data.result === "0x0") {
        console.log("⚠️ Balance is zero")
        return 0
      }

      console.log("🔢 Raw balance (hex):", data.result)
      const balanceWei = Number.parseInt(data.result, 16)
      console.log("🔢 Balance in Wei:", balanceWei)

      if (isNaN(balanceWei)) {
        console.log("⚠️ Invalid balance data:", data.result)
        return 0
      }

      const balance = balanceWei / Math.pow(10, 18)
      console.log("💰 PEPU V2 Balance (formatted):", balance)
      console.log("🔍 === END PEPU V2 CHECK ===")
      return balance
    } catch (err: any) {
      console.error("❌ Error checking PEPU V2 balance:", err)
      console.log("🔍 === END PEPU V2 CHECK (ERROR) ===")
      return 0
    }
  }

  // ✅ Check SHILL balance on PEPU V2 (NOVA REDE)
  const checkShillBalance = async (address: string): Promise<number> => {
    try {
      console.log("🔍 === CHECKING SHILL BALANCE (NOVA REDE) ===")
      console.log("📍 Address:", address)
      console.log("🪙 Contract:", SHILL_CONTRACT_ADDRESS)
      console.log("🌐 Network: PEPU V2 (Chain ID: 3409)")
      console.log("🔗 RPC: https://rpc-pepu-v2-mainnet-0.t.conduit.xyz/")

      // Prepare the data for balanceOf call
      const paddedAddress = address.slice(2).padStart(64, "0")
      const callData = `0x70a08231${paddedAddress}`

      console.log("📝 Padded address:", paddedAddress)
      console.log("📝 Call data:", callData)

      const requestBody = {
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
      }
      console.log("📤 Request body:", JSON.stringify(requestBody, null, 2))

      const response = await fetch("https://rpc-pepu-v2-mainnet-0.t.conduit.xyz/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("📊 Raw SHILL response:", JSON.stringify(data, null, 2))

      if (data.error) {
        console.error("❌ RPC Error:", data.error)
        throw new Error(`RPC Error: ${data.error.message}`)
      }

      if (!data.result) {
        console.log("⚠️ No result in response")
        return 0
      }

      if (data.result === "0x" || data.result === "0x0") {
        console.log("⚠️ SHILL balance is zero")
        return 0
      }

      console.log("🔢 Raw balance (hex):", data.result)
      const balanceWei = Number.parseInt(data.result, 16)
      console.log("🔢 Balance in Wei:", balanceWei)

      if (isNaN(balanceWei)) {
        console.log("⚠️ Invalid SHILL balance data:", data.result)
        return 0
      }

      const balance = balanceWei / Math.pow(10, 18)
      console.log("💰 SHILL Balance (formatted):", balance)
      console.log("🔍 === END SHILL CHECK ===")
      return balance
    } catch (err: any) {
      console.error("❌ Error checking SHILL balance:", err)
      console.log("🔍 === END SHILL CHECK (ERROR) ===")
      return 0
    }
  }

  // ✅ Test network connectivity for PEPU V2
  const testNetworkConnectivity = async () => {
    try {
      console.log("🔍 === TESTING PEPU V2 NETWORK CONNECTIVITY ===")

      // Test PEPU V2 RPC
      const response = await fetch("https://rpc-pepu-v2-mainnet-0.t.conduit.xyz/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_chainId",
          params: [],
          id: 1,
        }),
      })

      const data = await response.json()
      console.log("🌐 Network response:", data)

      if (data.result) {
        const chainId = Number.parseInt(data.result, 16)
        console.log("🔗 Connected to Chain ID:", chainId)
        console.log("✅ PEPU V2 Network connectivity: OK")
      }

      console.log("🔍 === END CONNECTIVITY TEST ===")
    } catch (err) {
      console.error("❌ PEPU V2 Network connectivity test failed:", err)
    }
  }

  // ✅ Check all balances across networks (L1 + V2)
  const checkAllBalances = async (address: string) => {
    try {
      console.log("🔍 === STARTING COMPREHENSIVE BALANCE CHECK ===")
      console.log("📍 Wallet Address:", address)

      setWallet((prev) => ({ ...prev, isLoading: true }))

      // Test network connectivity first
      await testNetworkConnectivity()

      // Verificar todos os saldos em paralelo
      console.log("📊 Checking all balances in parallel...")
      const [pepuL1, pepuV2, shillBalance] = await Promise.all([
        checkPepuBalanceL1(address),
        checkPepuBalanceV2(address),
        checkShillBalance(address),
      ])

      const totalPepu = pepuL1 + pepuV2

      setWallet((prev) => ({
        ...prev,
        shillBalance: shillBalance || 0,
        pepuL1Balance: pepuL1,
        pepuV2Balance: pepuV2,
        totalPepuBalance: totalPepu,
        isLoading: false,
      }))

      console.log("💰 === FINAL BALANCE SUMMARY ===")
      console.log("  🟢 SHILL (PEPU V2):", shillBalance || 0)
      console.log("  🔵 PEPU L1 (Ethereum):", pepuL1)
      console.log("  🟣 PEPU V2 (Nova Rede):", pepuV2)
      console.log("  📊 Total PEPU:", totalPepu)
      console.log("🔍 === END COMPREHENSIVE CHECK ===")
    } catch (err: any) {
      console.error("❌ Error checking balances:", err)
      setWallet((prev) => ({
        ...prev,
        isLoading: false,
        shillBalance: 0,
        pepuL1Balance: 0,
        pepuV2Balance: 0,
        totalPepuBalance: 0,
      }))
    }
  }

  // Add PEPU V2 network to wallet
  const addPepuV2Network = async () => {
    try {
      if (!window.ethereum) return

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0xd51", // 3409 em hexadecimal
            chainName: "Pepe Unchained",
            nativeCurrency: {
              name: "Pepe Unchained",
              symbol: "PEPU",
              decimals: 18,
            },
            rpcUrls: ["https://rpc-pepu-v2-mainnet-0.t.conduit.xyz/"],
            blockExplorerUrls: ["https://explorer-pepe-unchained-gupg0lo9wf.t.conduit.xyz/"],
          },
        ],
      })
    } catch (err) {
      console.error("Error adding PEPU V2 network:", err)
    }
  }

  // Add token to wallet
  const addTokenToWallet = async () => {
    try {
      if (!window.ethereum) return

      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: SHILL_CONTRACT_ADDRESS,
            symbol: "SHILL",
            decimals: 18,
            image: "/images/profile-logo.png",
          },
        },
      })
    } catch (err) {
      console.error("Error adding token:", err)
    }
  }

  // Copy contract address
  const copyContract = () => {
    navigator.clipboard.writeText(SHILL_CONTRACT_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Format address
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Format balance
  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(balance)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="relative">
                <Image
                  src="/images/profile-logo.png"
                  alt="CoinShillers Logo"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <span className={`${isMobile ? "text-lg" : "text-2xl"} font-title text-gray-900`}>CoinShillers</span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#ecosystem" className="text-gray-600 hover:text-blue-600 transition-colors font-subtitle">
                Ecosystem
              </Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors font-subtitle">
                How It Works
              </Link>
              <Link href="/analytics" className="text-gray-600 hover:text-blue-600 transition-colors font-subtitle">
                Analytics
              </Link>
              <Link href="/packages" className="text-gray-600 hover:text-blue-600 transition-colors font-subtitle">
                Packages
              </Link>
              <Link href="/top10" className="text-gray-600 hover:text-blue-600 transition-colors font-subtitle">
                TOP 5
              </Link>
              <Link href="/velvet-room" className="text-gray-600 hover:text-blue-600 transition-colors font-subtitle">
                Velvet Room
              </Link>
            </div>

            {!wallet.isConnected ? (
              <Button
                onClick={() => setShowWalletModal(true)}
                disabled={wallet.isLoading}
                className={`bg-gradient-to-r from-blue-800 to-cyan-500 hover:from-blue-900 hover:to-cyan-600 text-white border-0 shadow-lg font-button ${
                  isMobile ? "px-4 py-3 text-sm" : "px-6 py-2"
                }`}
              >
                <Wallet className={`${isMobile ? "w-4 h-4 mr-1" : "w-4 h-4 mr-2"}`} />
                {wallet.isLoading ? "CONNECTING..." : isMobile ? "CONNECT" : "CONNECT WALLET"}
                {!isMobile && <ChevronDown className="w-4 h-4 ml-2" />}
                {isMobile && <Smartphone className="w-4 h-4 ml-1" />}
              </Button>
            ) : (
              <div
                className={`flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2 ${isMobile ? "text-xs" : ""}`}
              >
                <div className="text-right">
                  <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-600 font-label`}>
                    {formatAddress(wallet.address!)}
                  </p>
                  <div className={`flex space-x-2 ${isMobile ? "text-xs" : "text-xs"}`}>
                    <span className="text-green-600 font-label">
                      {wallet.isLoading ? "Loading..." : `${formatBalance(wallet.shillBalance)} SHILL`}
                    </span>
                    <span
                      className="text-blue-600 font-label"
                      title={`L1: ${formatBalance(wallet.pepuL1Balance)} | V2: ${formatBalance(wallet.pepuV2Balance)}`}
                    >
                      {wallet.isLoading ? "Loading..." : `${formatBalance(wallet.totalPepuBalance)} PEPU`}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <div
                    className={`w-2 h-2 rounded-full ${wallet.isLoading ? "bg-yellow-500 animate-pulse" : "bg-green-500 animate-pulse"}`}
                  ></div>
                  <div
                    className={`w-2 h-2 rounded-full ${wallet.isLoading ? "bg-yellow-500 animate-pulse" : "bg-blue-500 animate-pulse"}`}
                  ></div>
                </div>
              </div>
            )}
          </nav>

          {/* ✅ Mobile Menu */}
          {isMobile && (
            <div className="flex justify-center space-x-4 mt-4 pt-4 border-t border-gray-100">
              <Link
                href="#how-it-works"
                className="text-gray-600 hover:text-blue-600 transition-colors text-xs font-subtitle whitespace-nowrap"
              >
                How It Works
              </Link>
              <Link
                href="/analytics"
                className="text-gray-600 hover:text-blue-600 transition-colors text-xs font-subtitle whitespace-nowrap"
              >
                Analytics
              </Link>
              <Link
                href="/packages"
                className="text-gray-600 hover:text-blue-600 transition-colors text-xs font-subtitle whitespace-nowrap"
              >
                Packages
              </Link>
              <Link
                href="/top10"
                className="text-gray-600 hover:text-blue-600 transition-colors text-xs font-subtitle whitespace-nowrap"
              >
                TOP 5
              </Link>
              <Link
                href="/velvet-room"
                className="text-gray-600 hover:text-blue-600 transition-colors text-xs font-subtitle whitespace-nowrap"
              >
                Velvet Room
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-6">
                  <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-700 font-label">Powering Growth in PEPU V2 Network</span>
                </div>

                <h1
                  className={`${isMobile ? "text-3xl" : "text-5xl md:text-6xl"} text-gray-900 mb-6 leading-tight font-title`}
                >
                  Fuel the Growth of
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-500 to-pink-500">
                    Every Token
                  </span>
                </h1>

                <p
                  className={`${isMobile ? "text-lg" : "text-xl"} text-gray-600 mb-8 leading-relaxed font-description`}
                >
                  CoinShillers is the growth engine for the PEPU V2 ecosystem. We amplify, promote, and accelerate the
                  success of emerging tokens through community-driven marketing power.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button
                    asChild
                    size="sm"
                    className={`bg-gradient-to-r from-blue-800 to-cyan-500 hover:from-blue-900 hover:to-cyan-600 text-white ${isMobile ? "px-3 py-1 text-sm" : "px-4 py-2 text-sm"} h-auto rounded-xl border-0 shadow-lg font-button`}
                  >
                    <a href={PUMPPAD_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <Rocket className="w-5 h-5 mr-2" />
                      Buy $SHILL on PumpPad
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className={`bg-gradient-to-r from-blue-800 to-cyan-500 hover:from-blue-900 hover:to-cyan-600 text-white ${isMobile ? "px-3 py-1 text-sm" : "px-4 py-2 text-sm"} h-auto rounded-xl border-0 shadow-lg font-button`}
                  >
                    <a
                      href={GECKO_TERMINAL_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Buy on GeckoTerminal
                    </a>
                  </Button>
                </div>

                {/* ✅ Social Media Links with Official Icons */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 font-label">Follow us:</span>
                  <div className="flex space-x-3">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-button bg-transparent"
                    >
                      <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        X (Twitter)
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 font-button bg-transparent"
                    >
                      <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                        </svg>
                        Telegram
                      </a>
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Right Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative">
                  <Image src="/images/full-logo.png" alt="CoinShillers" width={500} height={500} className="mx-auto" />

                  {/* Floating Elements */}
                  <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                    className="absolute top-10 right-10 bg-green-100 p-3 rounded-full"
                  >
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </motion.div>

                  <motion.div
                    animate={{ y: [10, -10, 10] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
                    className="absolute bottom-10 left-10 bg-blue-100 p-3 rounded-full"
                  >
                    <Network className="w-6 h-6 text-blue-600" />
                  </motion.div>

                  <motion.div
                    animate={{ y: [-5, 15, -5] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: 2 }}
                    className="absolute top-1/2 left-0 bg-pink-100 p-3 rounded-full"
                  >
                    <Users className="w-6 h-6 text-pink-600" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className={`${isMobile ? "text-3xl" : "text-4xl md:text-5xl"} text-gray-900 mb-6 font-title`}>
              How CoinShillers
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
                Powers Growth
              </span>
            </h2>
            <p className={`${isMobile ? "text-lg" : "text-xl"} text-gray-600 max-w-3xl mx-auto font-description`}>
              We're not just another token. We're the marketing engine that helps other tokens in the PEPU V2 ecosystem
              reach their full potential.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Network className="w-8 h-8" />,
                title: "Community Amplification",
                description:
                  "Our army of shillers promotes and amplifies promising tokens across all social platforms.",
                color: "blue",
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Growth Acceleration",
                description:
                  "Strategic marketing campaigns designed to boost visibility and adoption of partner tokens.",
                color: "green",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Ecosystem Support",
                description:
                  "Exclusive access to our Velvet Room for premium marketing services and insider opportunities.",
                color: "pink",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Card className="bg-white border-gray-100 hover:border-gray-200 transition-all duration-300 h-full shadow-sm hover:shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div
                      className={`inline-flex p-4 rounded-2xl mb-6 ${
                        feature.color === "blue"
                          ? "bg-blue-100"
                          : feature.color === "green"
                            ? "bg-green-100"
                            : "bg-pink-100"
                      }`}
                    >
                      <div
                        className={`${
                          feature.color === "blue"
                            ? "text-blue-600"
                            : feature.color === "green"
                              ? "text-green-600"
                              : "text-pink-600"
                        }`}
                      >
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className={`${isMobile ? "text-xl" : "text-2xl"} text-gray-900 mb-4 font-subtitle`}>
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-body">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: "5", label: "Tokens Promoted" },
              { number: "100", label: "Community Members" },
              { number: "2", label: "Successful Campaigns" },
              { number: "9/24", label: "Marketing Support" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div
                  className={`${isMobile ? "text-3xl" : "text-4xl md:text-5xl"} text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500 mb-2 font-title`}
                >
                  {stat.number}
                </div>
                <div className="text-gray-600 font-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className={`${isMobile ? "text-3xl" : "text-4xl md:text-5xl"} text-gray-900 mb-4 font-title`}>
              🗺️ CoinShillers Roadmap
            </h2>
            <p className={`${isMobile ? "text-lg" : "text-xl"} text-gray-600 font-label`}>
              The Army of Shillers Never Sleeps
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Q3 2025 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <h3 className={`${isMobile ? "text-lg" : "text-xl"} text-gray-900 font-subtitle`}>
                    July 2025 – Initial Launch
                  </h3>
                </div>
                <ul className="space-y-2 text-gray-600 font-body">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    $SHILL token creation on PEPU V2 Network
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    Official website with modern web3 design
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    Official channels launch (X, Telegram, Geckoterminal)
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    First wave of organic marketing with memes and spaces
                  </li>
                </ul>
              </motion.div>

              {/* Q4 2025 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <h3 className={`${isMobile ? "text-lg" : "text-xl"} text-gray-900 font-subtitle`}>
                    August 2025 – Massive Engagement
                  </h3>
                </div>
                <ul className="space-y-2 text-gray-600 font-body">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">📈</span>
                    On-chain charts integration and holders dashboard
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">🎮</span>
                    "Shill Game" prototype: game to reward holders
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">🤝</span>
                    Partnerships with PEPU V2 community projects
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">🎤</span>
                    Weekly events with chosen coins
                  </li>
                </ul>
              </motion.div>

              {/* Q1 2026 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <h3 className={`${isMobile ? "text-lg" : "text-xl"} text-gray-900 font-subtitle`}>
                    September 2025 – Ecosystem Domination
                  </h3>
                </div>
                <ul className="space-y-2 text-gray-600 font-body">
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">💡</span>
                    Web3 projects curation with real engagement rankings
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">🛡️</span>
                    "Shill Verified Projects" verification system
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">🧱</span>
                    Partnerships with L2s and DeFi communities for cross-promotions
                  </li>
                </ul>
              </motion.div>

              {/* ShillAI */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-orange-200"
              >
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3 animate-pulse"></div>
                  <h3 className={`${isMobile ? "text-lg" : "text-xl"} text-gray-900 font-subtitle`}>
                    October 2025 – Shill and AI Birth
                  </h3>
                </div>
                <ul className="space-y-2 text-gray-600 font-body">
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">🧠</span>
                    Launch of ShillAI, CoinShillers' official AI
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">💬</span>
                    Help community members create web3 project ideas
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">🛠️</span>
                    Generate names, tokens, logos, descriptions & smart contracts
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">🌟</span>
                    Website integrated interface, free for holders
                  </li>
                </ul>
              </motion.div>
            </div>

            {/* Future Vision */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 text-center bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 border border-blue-200"
            >
              <h4 className={`${isMobile ? "text-xl" : "text-2xl"} text-gray-900 mb-4 font-subtitle`}>
                🌟 From October onwards... Something Big Is Coming
              </h4>
              <p className="text-gray-600 font-body max-w-2xl mx-auto">
                New secret features in development, experimental technology for mass engagement, and ecosystem expansion
                focused on innovation, decentralization and collective creativity.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2 className={`${isMobile ? "text-3xl" : "text-4xl md:text-5xl"} text-gray-900 mb-6 font-title`}>
              Ready to Amplify Your Token?
            </h2>
            <p className={`${isMobile ? "text-lg" : "text-xl"} text-gray-600 mb-8 max-w-2xl mx-auto font-description`}>
              Join the CoinShillers ecosystem and let our community help your token reach new heights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                asChild
                size="lg"
                className={`bg-gradient-to-r from-blue-800 to-cyan-500 hover:from-blue-900 hover:to-cyan-600 text-white ${isMobile ? "px-8 py-3 text-base" : "px-12 py-4 text-lg"} h-auto rounded-xl shadow-lg font-button`}
              >
                <a href={GECKO_TERMINAL_LINK} target="_blank" rel="noopener noreferrer">
                  Buy $SHILL Now
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className={`border-gray-200 text-gray-700 hover:bg-gray-50 ${isMobile ? "px-8 py-3 text-base" : "px-12 py-4 text-lg"} h-auto rounded-xl font-button`}
              >
                <Link href="/velvet-room">Access Velvet Room</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sunday Spotlight Section */}
      <section className="py-16 bg-purple-100">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className={`${isMobile ? "text-3xl" : "text-4xl"} text-purple-900 mb-6 font-title`}>
              💫 Sunday Spotlight 💫
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Degen Time Spotlight */}
              <Card className="bg-white border-purple-200 shadow-xl p-8">
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold text-purple-700 mb-4 font-subtitle">Degen Time 🔽🧠</h3>
                  <p className="text-lg text-gray-700 mb-4 font-description">
                    Degen Time is this week's spotlight on Pepe Unchained L2! An all-in-one platform featuring staking
                    (140% APY), trading dashboard, portfolio tracker, and wallet inspector 🧩
                  </p>
                  <p className="text-lg text-gray-700 mb-4 font-description">
                    Track tokens, avoid scams, follow whales, and put your $PEPU to work 💼🚀
                  </p>
                  <p className="text-lg text-gray-700 mb-6 font-description">No hype. Just real utility 🔥</p>
                  <div className="space-y-3 text-sm text-gray-600 font-body">
                    <p className="font-mono break-all">
                      CA: <span className="text-purple-600">0x3cb51202e41890c89b2a46bd5c921e2d55665637</span>
                    </p>
                    <p>
                      🌐{" "}
                      <a
                        href="https://degentime.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        https://degentime.io
                      </a>
                    </p>
                    <p>
                      X:{" "}
                      <a
                        href="https://x.com/degentimeio?s=21"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        https://x.com/degentimeio?s=21
                      </a>
                    </p>
                    <p>
                      TG:{" "}
                      <a
                        href="https://t.me/+qPYvitimipNlN2Jk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        https://t.me/+qPYvitimipNlN2Jk
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* GameYard Spotlight */}
              <Card className="bg-white border-purple-200 shadow-xl p-8">
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold text-purple-700 mb-4 font-subtitle">GameYard 🕹️🎮</h3>
                  <p className="text-lg text-gray-700 mb-4 font-description">
                    GameYard is the featured project on Pepe Unchained L2! They've already started PvP tournaments with
                    300K $PEPU in prizes 🚀
                  </p>
                  <p className="text-lg text-gray-700 mb-4 font-description">
                    Live games available: Carrom and Curak (more coming soon!) ⚡️
                  </p>
                  <p className="text-lg text-gray-700 mb-6 font-description">
                    Active community, creative rewards, and real gameplay – no empty promises 🔥
                  </p>
                  <div className="space-y-3 text-sm text-gray-600 font-body">
                    <p className="font-mono break-all">
                      CA: <span className="text-purple-600">0x631420b5cd6342b3609e59e6e41b4c8aaddf93af</span>
                    </p>
                    <p>
                      🌐{" "}
                      <a
                        href="https://gameyard.pro"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        https://gameyard.pro
                      </a>
                    </p>
                    <p>
                      X:{" "}
                      <a
                        href="https://x.com/GameyardPvP"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        https://x.com/GameyardPvP
                      </a>
                    </p>
                    <p>
                      TG:{" "}
                      <a
                        href="https://t.me/gameyardofficial"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        https://t.me/gameyardofficial
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* PEPU Bank Spotlight (Original) */}
              <Card className="bg-white border-purple-200 shadow-xl p-8">
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold text-purple-700 mb-4 font-subtitle">PEPU Bank 🐸🧠</h3>
                  <p className="text-lg text-gray-700 mb-4 font-description">
                    PEPU Bank 🐸🧠 é o projeto em destaque no Pepe Unchained L2! They've reached a new ATH in votes 🔥
                  </p>
                  <p className="text-lg text-gray-700 mb-4 font-description">
                    SuperBridge will launch in July for instant transfers to L1 ⚡️
                  </p>
                  <p className="text-lg text-gray-700 mb-6 font-description">
                    Zero gas fees, direct $PEPU purchase, more transparent white paper 👀 Community #1 🚀
                  </p>
                  <div className="space-y-3 text-sm text-gray-600 font-body">
                    <p className="font-mono break-all">
                      CA: <span className="text-purple-600">0x82144c93bd531e46f31033fe22d1055af17a514c</span>
                    </p>
                    <p>
                      X:{" "}
                      <a
                        href="https://x.com/pepubank"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        https://x.com/pepubank
                      </a>
                    </p>
                    <p>
                      TG:{" "}
                      <a
                        href="https://t.me/Pepu_BANK"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        https://t.me/Pepu_BANK
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <Image
                src="/images/profile-logo.png"
                alt="CoinShillers Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className={`${isMobile ? "text-lg" : "text-xl"} text-gray-900 font-title`}>CoinShillers</span>
            </div>

            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className={`flex items-center ${isMobile ? "space-x-2" : "space-x-4"}`}>
                <Button
                  onClick={copyContract}
                  variant="outline"
                  size="sm"
                  className={`border-gray-200 text-gray-700 hover:bg-gray-50 font-button bg-transparent ${
                    isMobile ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
                  }`}
                >
                  {copied ? "Copied!" : "Copy Contract"}
                </Button>
                <Button
                  onClick={addTokenToWallet}
                  variant="outline"
                  size="sm"
                  className={`border-gray-200 text-gray-700 hover:bg-gray-50 font-button bg-transparent ${
                    isMobile ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
                  }`}
                >
                  Add to Wallet
                </Button>
                <Button
                  onClick={addPepuV2Network}
                  variant="outline"
                  size="sm"
                  className={`border-gray-200 text-gray-700 hover:bg-gray-50 font-button bg-transparent ${
                    isMobile ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
                  }`}
                >
                  Add PEPU V2 Network
                </Button>
              </div>

              <div className="text-center md:text-right">
                <p className="text-sm text-gray-600 font-label">The Army of Shillers Never Sleeps</p>
                <p className="text-xs text-gray-500 font-body">Powered by PEPU V2 Network</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500 font-body">
              © 2025 CoinShillers. All rights reserved. Built on Pepe Unchained V2.
            </p>
          </div>
        </div>
      </footer>

      {/* Wallet Connection Modal */}
      <AnimatePresence>
        {showWalletModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowWalletModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-title text-gray-900">Connect Wallet</h3>
                <Button
                  onClick={() => setShowWalletModal(false)}
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {walletOptions.map((option) => (
                  <Button
                    key={option.id}
                    onClick={() => connectWallet(option.id)}
                    disabled={wallet.isLoading}
                    variant="outline"
                    className="w-full justify-start p-4 h-auto border-gray-200 hover:bg-gray-50 font-button bg-transparent"
                  >
                    <span className="text-2xl mr-3">{option.icon}</span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{option.name}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                    {isMobile && <Smartphone className="w-4 h-4 ml-auto text-gray-400" />}
                  </Button>
                ))}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm font-body">{error}</p>
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 font-body">
                  {isMobile
                    ? "Make sure you have a Web3 wallet app installed on your device"
                    : "By connecting, you agree to our Terms of Service"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
