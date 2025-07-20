"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Wallet,
  Search,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Crown,
  Shield,
  ExternalLink,
  Plus,
  Trash2,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { fetchPepuErc20Price } from "@/src/utils/fetchPepuPrice" // Importação atualizada para o novo nome da função

const SHILL_CONTRACT_ADDRESS = "0x43Ab9afcEca24cFc1E0F9221d6C8775a090FE340"
const MINIMUM_SHILL_BALANCE = 10000000 // 10 million tokens
const PEPU_V2_RPC = "https://rpc-pepu-v2-mainnet-0.t.conduit.xyz/"
const PEPU_V2_EXPLORER = "https://pepuscan.com"
const WHITELISTED_ADDRESS = "0x6546bb5c7a5C9072559ec49Cc9F9D9aBdb580754" // Endereço whitelisted para acesso

// Lista de tokens conhecidos da rede PEPU V2
const KNOWN_TOKENS = [
  {
    address: "0x0000000000000000000000000000000000000000", // Placeholder para o token nativo
    symbol: "PEPU_NATIVE",
    name: "Pepe Unchained (Native)",
    decimals: 18,
    isNative: true,
  },
  {
    address: "0x43Ab9afcEca24cFc1E0F9221d6C8775a090FE340",
    symbol: "SHILL",
    name: "CoinShillers",
    decimals: 18,
    isNative: false,
  },
  {
    address: "0x93aA0ccD1e5628d3A841C4DbdF602D9eb04085d6",
    symbol: "PEPU_ERC20", // Renomeado para diferenciar do nativo
    name: "Pepe Unchained Token (ERC-20)",
    decimals: 18,
    isNative: false,
  },
  {
    address: "0x71942200c579319c89c357b55a9d5c0e0ad2403e",
    symbol: "PEPE",
    name: "Pepe",
    decimals: 18,
    isNative: false,
  },
  {
    address: "0x82144C93bd531E46F31033FE22D1055Af17A514c",
    symbol: "PENK",
    name: "PENK",
    decimals: 18,
    isNative: false,
  },
  {
    address: "0x631420b5cd6342b3609e59e6e41b4c8aaddf93af",
    symbol: "GYD",
    name: "Gameyard",
    decimals: 18,
    isNative: false,
  },
  {
    address: "0x6960dc07dcf9a1023ff6cc44f418dee6ebd83693",
    symbol: "DGT",
    name: "DEGEN TIME",
    decimals: 18,
    isNative: false,
  },
]

// Mock prices for demonstration purposes (as fallback if API fails or token not found)
const MOCK_TOKEN_PRICES: { [key: string]: number } = {
  SHILL: 0.0000023,
  PEPU_NATIVE: 0.0008187, // Usar o preço do ERC-20 para o nativo, se for o mesmo ativo
  PEPU_ERC20: 0.0008187, // Preço para o token ERC-20
  PEPE: 0.0000012,
  PENK: 0.0000008,
  GYD: 0.0000015, // Preço mockado para Gameyard
  DGT: 0.0000045, // Mock price for DEGEN TIME
}

interface TokenBalance {
  address: string
  symbol: string
  name: string
  balance: number
  decimals: number
  isNative: boolean
  usdValue: number
  priceChange24h?: number
}

interface WalletState {
  address: string | null
  isConnected: boolean
  shillBalance: number
  hasAccess: boolean
  isLoading: boolean
}

interface TrackedWallet {
  address: string
  alias: string
  tokens: TokenBalance[]
  totalValue: number
  lastUpdated: Date
}

// Function to fetch token prices from GeckoTerminal API and Infura/Uniswap for PEPU ERC-20
async function fetchTokenPrices(tokensToFetch: typeof KNOWN_TOKENS): Promise<Record<string, number>> {
  const prices: Record<string, number> = {}
  const networkId = "pepe-unchained"

  // Separar tokens com base no método de busca
  const tokensForGecko = tokensToFetch.filter(
    (token) => token.symbol !== "PEPU_ERC20" && token.symbol !== "PEPU_NATIVE", // Excluir ambos os PEPU
  )
  const pepuErc20Token = tokensToFetch.find((token) => token.symbol === "PEPU_ERC20")
  const pepuNativeToken = tokensToFetch.find((token) => token.symbol === "PEPU_NATIVE")

  // 1. Buscar preços para tokens ERC-20 do GeckoTerminal (excluindo PEPU_ERC20 e PEPU_NATIVE)
  if (tokensForGecko.length > 0) {
    const contractAddresses = tokensForGecko.map((token) => token.address).join(",")
    try {
      const response = await fetch(
        `https://api.geckoterminal.com/api/v2/networks/${networkId}/tokens/multi/${contractAddresses}`,
        {
          headers: {
            Accept: "application/json;version=20230302",
          },
        },
      )

      if (!response.ok) {
        console.error(`GeckoTerminal API error for ERC-20s on ${networkId}: ${response.status} ${response.statusText}`)
        tokensForGecko.forEach((token) => {
          prices[token.symbol] = MOCK_TOKEN_PRICES[token.symbol] || 0
        })
      } else {
        const data = await response.json()
        if (data.data && Array.isArray(data.data)) {
          data.data.forEach((item: any) => {
            const tokenAttributes = item.attributes
            if (tokenAttributes && tokenAttributes.price_usd) {
              const symbol = tokensForGecko.find(
                (t) => t.address.toLowerCase() === tokenAttributes.address.toLowerCase(),
              )?.symbol
              if (symbol) {
                prices[symbol] = Number.parseFloat(tokenAttributes.price_usd)
              }
            }
          })
        }
      }
    } catch (error) {
      console.error("Error fetching ERC-20 token prices from GeckoTerminal:", error)
      tokensForGecko.forEach((token) => {
        prices[token.symbol] = MOCK_TOKEN_PRICES[token.symbol] || 0
      })
    }
  }

  // 2. Buscar preço para PEPU_ERC20 usando a função dedicada
  if (pepuErc20Token) {
    try {
      const pricePerPepu = await fetchPepuErc20Price()
      prices[pepuErc20Token.symbol] = pricePerPepu
      console.log(`[fetchTokenPrices] Fetched PEPU_ERC20 price: ${pricePerPepu}`)
    } catch (error) {
      console.error(`❌ Error fetching ${pepuErc20Token.symbol} price using dedicated function:`, error)
      prices[pepuErc20Token.symbol] = MOCK_TOKEN_PRICES[pepuErc20Token.symbol] || 0
    }
  }

  // 3. Atribuir preço para PEPU_NATIVE (usando mock ou outra fonte se disponível)
  if (pepuNativeToken) {
    // Por enquanto, usaremos o preço mockado para o token nativo.
    // Se houver uma API para o preço do PEPU nativo, ela seria integrada aqui.
    prices[pepuNativeToken.symbol] = MOCK_TOKEN_PRICES[pepuNativeToken.symbol] || 0
    console.log(`[fetchTokenPrices] Assigned PEPU_NATIVE price: ${prices[pepuNativeToken.symbol]}`)
  }

  // Garantir que todos os tokens tenham um preço, mesmo que não encontrados em nenhuma API
  tokensToFetch.forEach((token) => {
    if (prices[token.symbol] === undefined) {
      prices[token.symbol] = MOCK_TOKEN_PRICES[token.symbol] || 0 // Fallback para preço mockado
    }
  })

  console.log("💰 Final prices object:", prices)
  return prices
}

const getTokenBalance = async (walletAddress: string, tokenAddress: string, decimals: number, isNative: boolean) => {
  try {
    const requestBody = {
      jsonrpc: "2.0",
      method: isNative ? "eth_getBalance" : "eth_call",
      params: isNative
        ? [walletAddress, "latest"]
        : [
            {
              to: tokenAddress,
              data: `0x70a08231${walletAddress.slice(2).padStart(64, "0")}`,
            },
            "latest",
          ],
      id: 1,
    }

    console.log(
      `[getTokenBalance] Requesting balance for ${tokenAddress} (isNative: ${isNative}) with method: ${requestBody.method}`,
    )
    console.log(`[getTokenBalance] Request body:`, JSON.stringify(requestBody, null, 2))

    const response = await fetch(PEPU_V2_RPC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      console.error(`[getTokenBalance] HTTP error for ${tokenAddress}: ${response.status} ${response.statusText}`)
      return 0
    }

    const data = await response.json()
    console.log(`[getTokenBalance] Raw RPC response for ${tokenAddress}:`, data)
    if (data.error || !data.result) {
      console.log(
        `[getTokenBalance] Error or no result for ${tokenAddress}. Returning 0. Error: ${data.error?.message || "No result"}`,
      )
      return 0
    }

    const rawBalanceHex = data.result
    if (rawBalanceHex === "0x") {
      console.log(`[getTokenBalance] Received "0x" for ${tokenAddress}. Treating as zero balance.`)
      return 0
    }

    console.log(`[getTokenBalance] Raw result for ${tokenAddress}:`, rawBalanceHex)
    const balanceWei = Number.parseInt(rawBalanceHex, 16)
    if (isNaN(balanceWei)) {
      console.error(`[getTokenBalance] Invalid balance data for ${tokenAddress}: ${rawBalanceHex}. Returning 0.`)
      return 0
    }

    return balanceWei / Math.pow(10, decimals)
  } catch (err) {
    console.error(`Error getting balance for ${tokenAddress}:`, err)
    return 0
  }
}

export default function PortfolioTrackerPage() {
  const [mounted, setMounted] = useState(false)
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    shillBalance: 0,
    hasAccess: false,
    isLoading: false,
  })

  const [trackedWallets, setTrackedWallets] = useState<TrackedWallet[]>([])
  const [newWalletAddress, setNewWalletAddress] = useState("")
  const [newWalletAlias, setNewWalletAlias] = useState("")
  const [isAddingWallet, setIsAddingWallet] = useState(false)
  const [loadingWallets, setLoadingWallets] = useState<string[]>([])
  const [error, setError] = useState<string>("")
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [hideBalances, setHideBalances] = useState(false)

  // Garantir que o componente só execute lógica após estar montado
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const initializeApp = async () => {
      try {
        // Aguardar um pouco para garantir que tudo esteja carregado
        await new Promise((resolve) => setTimeout(resolve, 500))

        await checkWalletConnection()
        loadSavedWallets()
      } catch (err) {
        console.error("Error initializing app:", err)
        setError("Failed to initialize. Please refresh the page.")
      }
    }

    initializeApp()
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
      // Não definir erro aqui para não quebrar a inicialização
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
      console.log("🔍 Checking SHILL balance...")

      // ✅ Lógica para endereço whitelisted
      if (address.toLowerCase() === WHITELISTED_ADDRESS.toLowerCase()) {
        console.log("✅ Whitelisted address detected. Granting access to Portfolio Tracker.")
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

      console.log("💰 SHILL Balance:", balance.toLocaleString())
      console.log("🎯 Access:", hasAccess ? "✅ GRANTED" : "❌ DENIED")
    } catch (err: any) {
      console.error("❌ Error checking SHILL balance:", err)
      setError("Failed to check SHILL balance")
      setWallet((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const scanWalletTokens = async (walletAddress: string): Promise<TokenBalance[]> => {
    const tokens: TokenBalance[] = []
    const prices = await fetchTokenPrices(KNOWN_TOKENS) // Fetch prices for all known tokens

    for (const token of KNOWN_TOKENS) {
      try {
        const balance = await getTokenBalance(walletAddress, token.address, token.decimals, token.isNative)
        const price = prices[token.symbol] || 0 // Get fetched/simulated price, default to 0
        const usdValue = balance * price

        console.log(
          `[scanWalletTokens] Token: ${token.symbol}, Balance: ${balance}, Price: ${price}, USD Value: ${usdValue}`,
        ) // ADD THIS LINE

        if (balance > 0) {
          tokens.push({
            address: token.address,
            symbol: token.symbol,
            name: token.name,
            balance,
            decimals: token.decimals,
            isNative: token.isNative,
            usdValue, // Include calculated USD value
            priceChange24h: 0, // Placeholder for future API integration
          })
        }
      } catch (err) {
        console.error(`Error scanning token ${token.symbol}:`, err)
      }
    }

    return tokens
  }

  const addWallet = async () => {
    if (!newWalletAddress || !newWalletAlias) {
      setError("Please enter both wallet address and alias")
      return
    }

    if (!newWalletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError("Invalid wallet address format")
      return
    }

    if (trackedWallets.some((w) => w.address.toLowerCase() === newWalletAddress.toLowerCase())) {
      setError("Wallet already being tracked")
      return
    }

    setIsAddingWallet(true)
    setLoadingWallets((prev) => [...prev, newWalletAddress])
    setError("")

    try {
      console.log("🔍 Scanning wallet:", newWalletAddress)
      const tokens = await scanWalletTokens(newWalletAddress)

      const totalValue = tokens.reduce((sum, token) => sum + token.usdValue, 0) // Use usdValue for total

      const newWallet: TrackedWallet = {
        address: newWalletAddress,
        alias: newWalletAlias,
        tokens,
        totalValue,
        lastUpdated: new Date(),
      }

      const updatedWallets = [...trackedWallets, newWallet]
      setTrackedWallets(updatedWallets)
      saveWallets(updatedWallets)

      setNewWalletAddress("")
      setNewWalletAlias("")
      console.log(`✅ Added wallet ${newWalletAlias} with ${tokens.length} tokens`)
    } catch (err: any) {
      setError(err.message || "Error scanning wallet")
    } finally {
      setIsAddingWallet(false)
      setLoadingWallets((prev) => prev.filter((addr) => addr !== newWalletAddress))
    }
  }

  const refreshWallet = async (walletAddress: string) => {
    setLoadingWallets((prev) => [...prev, walletAddress])

    try {
      const tokens = await scanWalletTokens(walletAddress)
      const totalValue = tokens.reduce((sum, token) => sum + token.usdValue, 0) // Use usdValue for total

      const updatedWallets = trackedWallets.map((wallet) =>
        wallet.address === walletAddress
          ? {
              ...wallet,
              tokens,
              totalValue,
              lastUpdated: new Date(),
            }
          : wallet,
      )

      setTrackedWallets(updatedWallets)
      saveWallets(updatedWallets)
    } catch (err: any) {
      setError(`Error refreshing wallet: ${err.message}`)
    } finally {
      setLoadingWallets((prev) => prev.filter((addr) => addr !== walletAddress))
    }
  }

  const removeWallet = (walletAddress: string) => {
    const updatedWallets = trackedWallets.filter((wallet) => wallet.address !== walletAddress)
    setTrackedWallets(updatedWallets)
    saveWallets(updatedWallets)
  }

  const saveWallets = (wallets: TrackedWallet[]) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("coinshillers_tracked_wallets", JSON.stringify(wallets))
      }
    } catch (err) {
      console.error("Error saving wallets:", err)
    }
  }

  const loadSavedWallets = () => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const saved = localStorage.getItem("coinshillers_tracked_wallets")
        if (saved) {
          const wallets = JSON.parse(saved).map((w: any) => ({
            ...w,
            lastUpdated: new Date(w.lastUpdated),
          }))
          setTrackedWallets(wallets)
        }
      }
    } catch (err) {
      console.error("Error loading saved wallets:", err)
    }
  }

  const copyAddress = (address: string) => {
    try {
      if (typeof window !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(address)
        setCopiedAddress(address)
        setTimeout(() => setCopiedAddress(null), 2000)
      }
    } catch (err) {
      console.error("Error copying address:", err)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(2)}M`
    } else if (balance >= 1000) {
      return `${(balance / 1000).toFixed(2)}K`
    }
    return balance.toFixed(4)
  }

  const formatTokens = (amount: number) => {
    return new Intl.NumberFormat("en-US").format(Math.floor(amount))
  }

  // Não renderizar nada até estar montado
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
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 uppercase">Portfolio Tracker</span>
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Tracker</h1>
                <p className="text-gray-600">Connect your wallet to access the VIP portfolio tracker</p>
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
                  portfolio tracker.
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

  // Main Portfolio Tracker Interface
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
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 uppercase">Portfolio Tracker</span>
              <Crown className="w-6 h-6 text-yellow-500" />
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setHideBalances(!hideBalances)}
                variant="outline"
                size="sm"
                className="border-gray-200"
              >
                {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <div className="text-right">
                <p className="text-sm text-gray-600">{formatAddress(wallet.address!)}</p>
                <p className="text-xs text-green-600">{formatTokens(wallet.shillBalance)} $SHILL</p>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* VIP Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  <div>
                    <h2 className="text-xl font-bold text-yellow-800">VIP Portfolio Tracker</h2>
                    <p className="text-yellow-700">Exclusive access for elite $SHILL holders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-yellow-600">Tracked Wallets</p>
                  <p className="text-2xl font-bold text-yellow-800">{trackedWallets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add New Wallet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white border-gray-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Add Wallet to Track</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Enter wallet address (0x...)"
                    value={newWalletAddress}
                    onChange={(e) => setNewWalletAddress(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Wallet alias/name"
                    value={newWalletAlias}
                    onChange={(e) => setNewWalletAlias(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <Button
                onClick={addWallet}
                disabled={isAddingWallet || !newWalletAddress || !newWalletAlias}
                className="w-full bg-gradient-to-r from-blue-800 to-cyan-500 hover:from-blue-900 hover:to-cyan-600 text-white border-0 shadow-lg"
              >
                {isAddingWallet ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Scanning Wallet...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Add & Scan Wallet
                  </>
                )}
              </Button>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tracked Wallets */}
        <div className="space-y-6">
          <AnimatePresence>
            {trackedWallets.map((trackedWallet, index) => (
              <motion.div
                key={trackedWallet.address}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white border-gray-100 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{trackedWallet.alias}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 font-mono">
                              {formatAddress(trackedWallet.address)}
                            </span>
                            <Button
                              onClick={() => copyAddress(trackedWallet.address)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              {copiedAddress === trackedWallet.address ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => refreshWallet(trackedWallet.address)}
                          disabled={loadingWallets.includes(trackedWallet.address)}
                          variant="outline"
                          size="sm"
                        >
                          <RefreshCw
                            className={`w-4 h-4 ${loadingWallets.includes(trackedWallet.address) ? "animate-spin" : ""}`}
                          />
                        </Button>
                        <Button
                          onClick={() => removeWallet(trackedWallet.address)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingWallets.includes(trackedWallet.address) ? (
                      <div className="text-center py-8">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <p className="text-gray-600">Scanning wallet for tokens...</p>
                      </div>
                    ) : trackedWallet.tokens.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">No tokens found in this wallet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Portfolio Summary */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                              <p className="text-sm text-gray-500">Total Tokens</p>
                              <p className="text-lg font-bold text-gray-900">{trackedWallet.tokens.length}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Total Value</p>
                              <p className="text-lg font-bold text-gray-900">
                                {hideBalances ? "****" : `$${trackedWallet.totalValue.toFixed(2)}`}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Last Updated</p>
                              <p className="text-sm text-gray-700">{trackedWallet.lastUpdated.toLocaleTimeString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Status</p>
                              <div className="flex items-center justify-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-sm text-green-600">Active</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Token List */}
                        <div className="space-y-3">
                          {trackedWallet.tokens.map((token) => (
                            <div
                              key={token.address}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    token.isNative
                                      ? "bg-gradient-to-br from-green-400 to-blue-500"
                                      : token.symbol === "SHILL"
                                        ? "bg-gradient-to-br from-orange-400 to-red-500"
                                        : "bg-gradient-to-br from-purple-400 to-pink-500"
                                  }`}
                                >
                                  <span className="text-white font-bold text-sm">
                                    {token.symbol.slice(0, 2).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900">{token.name}</h4>{" "}
                                  {/* Changed to token.name */}
                                  <p className="text-sm text-gray-500">{token.symbol}</p>{" "}
                                  {/* Added symbol below name */}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">
                                  {hideBalances ? "****" : formatBalance(token.balance)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {hideBalances ? "****" : `$${token.usdValue.toFixed(2)}`}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Explorer Link */}
                        <div className="pt-4 border-t border-gray-200">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent"
                          >
                            <a
                              href={`${PEPU_V2_EXPLORER}/address/${trackedWallet.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View on PEPU Explorer
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {trackedWallets.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Wallets Tracked Yet</h3>
              <p className="text-gray-600 mb-6">Add your first wallet to start tracking your PEPU V2 portfolio</p>
            </motion.div>
          )}
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-2">🔒 VIP Portfolio Tracker Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
                <ul className="space-y-2">
                  <li>• Track unlimited PEPU V2 wallets</li>
                  <li>• Real-time token balance monitoring</li>
                  <li>• Portfolio value calculations</li>
                  <li>• Privacy controls (hide/show balances)</li>
                </ul>
                <ul className="space-y-2">
                  <li>• Automatic token discovery</li>
                  <li>• Export portfolio data</li>
                  <li>• Historical balance tracking</li>
                  <li>• Advanced analytics (coming soon)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

declare global {
  interface Window {
    ethereum?: any
  }
}
