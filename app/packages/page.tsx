"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageSquare, BarChart3, Twitter, Megaphone, Crown, ArrowLeft, Copy, Check, Send } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface PackageItem {
  id: string
  name: string
  price: number
  category: string
}

const packageCategories = [
  {
    title: "⭐️ Raid Assist ⭐️",
    icon: <MessageSquare className="w-6 h-6" />,
    color: "blue",
    items: [
      { id: "raid-1", name: "1 raid", price: 2, category: "raid-assist" },
      { id: "raid-3", name: "3 raids", price: 5, category: "raid-assist" },
    ],
  },
  {
    title: "⭐️ Poll Features ⭐️",
    icon: <BarChart3 className="w-6 h-6" />,
    color: "green",
    items: [
      { id: "poll-general", name: "General X poll", price: 2, category: "poll-features" },
      { id: "poll-spotlight", name: "Sunday Spotlight poll", price: 10, category: "poll-features" },
    ],
  },
  {
    title: "⭐️ X mentions ⭐️",
    icon: <Twitter className="w-6 h-6" />,
    color: "cyan",
    items: [
      { id: "x-repost", name: "X repost", price: 2, category: "x-mentions" },
      { id: "x-pinned-24", name: "X pinned post (24hrs)", price: 5, category: "x-mentions" },
      { id: "x-pinned-72", name: "X pinned post (72hrs)", price: 10, category: "x-mentions" },
      { id: "x-pinned-120", name: "X pinned post (120hrs)", price: 15, category: "x-mentions" },
    ],
  },
  {
    title: "⭐️ Full Promotions ⭐️",
    icon: <Megaphone className="w-6 h-6" />,
    color: "orange",
    items: [
      { id: "promo-3", name: "3 days", price: 30, category: "full-promotions" },
      { id: "promo-7", name: "7 days", price: 60, category: "full-promotions" },
      { id: "promo-30", name: "30 days", price: 200, category: "full-promotions" },
    ],
  },
  {
    title: "⭐️ Velvet Room Package ⭐️",
    icon: <Crown className="w-6 h-6" />,
    color: "purple",
    items: [{ id: "velvet-30", name: "30 days", price: 250, category: "velvet-room" }],
  },
]

export default function PackagesPage() {
  const [selectedItems, setSelectedItems] = useState<PackageItem[]>([])
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [telegramUsername, setTelegramUsername] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const walletAddress = "0x80BC9DE9806D82D0A0A0e3Bc54af98dE6eA64E77"

  const toggleItem = (item: PackageItem) => {
    setSelectedItems((prev) => {
      const isSelected = prev.find((selected) => selected.id === item.id)
      if (isSelected) {
        return prev.filter((selected) => selected.id !== item.id)
      } else {
        return [...prev, item]
      }
    })
  }

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0)

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    } catch (err) {
      console.error("Failed to copy address:", err)
    }
  }

  const sendToTelegram = async () => {
    if (!projectName.trim() || !telegramUsername.trim() || selectedItems.length === 0) {
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      const response = await fetch("/api/send-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: projectName.trim(),
          packages: selectedItems,
          totalPrice: totalPrice,
          telegramUsername: telegramUsername.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitSuccess(true)
        setTimeout(() => {
          setSubmitSuccess(false)
          setProjectName("")
          setTelegramUsername("")
          setSelectedItems([])
        }, 3000)
      } else {
        throw new Error(data.error || "Failed to send message")
      }
    } catch (error) {
      console.error("Error sending to Telegram:", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 text-white hover:text-blue-400 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <div className="flex items-center space-x-3">
                <Image
                  src="/images/profile-logo.png"
                  alt="CoinShillers Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="text-lg sm:text-xl font-title">CoinShillers</span>
              </div>
            </Link>
            <div className="text-xs sm:text-sm text-gray-300 font-subtitle">Packages & Services</div>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-title text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
              Promotion Packages
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-description">
            Select the services you need and get instant pricing
          </p>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {packageCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            >
              <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-gray-600 transition-all duration-300">
                <CardContent className="p-8">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`p-3 rounded-2xl ${
                        category.color === "blue"
                          ? "bg-blue-500/20 text-blue-400"
                          : category.color === "green"
                            ? "bg-green-500/20 text-green-400"
                            : category.color === "cyan"
                              ? "bg-cyan-500/20 text-cyan-400"
                              : category.color === "orange"
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-purple-500/20 text-purple-400"
                      }`}
                    >
                      {category.icon}
                    </div>
                    <h3 className="text-lg sm:text-2xl font-subtitle text-white whitespace-nowrap">{category.title}</h3>
                  </div>

                  {/* Package Items */}
                  <div className="space-y-3">
                    {category.items.map((item) => {
                      const isSelected = selectedItems.find((selected) => selected.id === item.id)
                      return (
                        <div
                          key={item.id}
                          className={`flex justify-between items-center p-4 rounded-lg border transition-all duration-300 ${
                            isSelected
                              ? "bg-blue-500/20 border-blue-500"
                              : "bg-gray-700/30 border-gray-600 hover:border-gray-500"
                          }`}
                        >
                          <span className="text-gray-300 font-body">{item.name}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-xl font-bold text-green-400 font-title">${item.price}</span>
                            <Button
                              onClick={() => toggleItem(item)}
                              size="sm"
                              className={`transition-all duration-300 ${
                                isSelected
                                  ? "bg-red-500 hover:bg-red-600 text-white"
                                  : "bg-blue-500 hover:bg-blue-600 text-white"
                              }`}
                            >
                              {isSelected ? "Remove" : "Select"}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Selected Items Summary */}
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardContent className="p-8">
                <h3 className="text-2xl font-subtitle text-white mb-6">Selected Packages</h3>
                <div className="space-y-3 mb-6">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                      <span className="text-gray-300 font-body">{item.name}</span>
                      <span className="text-green-400 font-bold font-title">${item.price}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-600 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-subtitle text-white">Total:</span>
                    <span className="text-3xl font-bold text-green-400 font-title">${totalPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Project Information Form */}
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardContent className="p-8">
                <h3 className="text-2xl font-subtitle text-white mb-6">Project Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="projectName" className="text-gray-300 font-body">
                      Project Name *
                    </Label>
                    <Input
                      id="projectName"
                      type="text"
                      placeholder="Enter your project name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="mt-2 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telegramUsername" className="text-gray-300 font-body">
                      Telegram Username *
                    </Label>
                    <Input
                      id="telegramUsername"
                      type="text"
                      placeholder="@yourusername"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                      className="mt-2 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Include the @ symbol (e.g., @username)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Payment Instructions */}
        {totalPrice > 0 && projectName.trim() && telegramUsername.trim() && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card className="bg-gradient-to-r from-green-900/50 to-blue-900/50 backdrop-blur-sm border-green-700">
              <CardContent className="p-8 text-center">
                <h3 className="text-3xl font-subtitle text-white mb-6">Payment Instructions</h3>
                <p className="text-xl text-gray-300 mb-8 font-body">
                  Send exactly <span className="text-green-400 font-bold">${totalPrice}</span> to the address below:
                </p>

                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-600 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-400 font-label">Wallet Address:</span>
                    <Button
                      onClick={copyAddress}
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                    >
                      {copiedAddress ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <code className="text-green-400 font-mono text-sm break-all">{walletAddress}</code>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mb-6">
                  <Button
                    onClick={sendToTelegram}
                    disabled={
                      isSubmitting || !projectName.trim() || !telegramUsername.trim() || selectedItems.length === 0
                    }
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 font-button px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Order Request
                      </>
                    )}
                  </Button>
                </div>

                {submitSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg"
                  >
                    <p className="text-green-300 font-body">
                      ✅ Order request sent successfully! Our team will contact you soon.
                    </p>
                  </motion.div>
                )}

                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg"
                  >
                    <p className="text-red-300 font-body">❌ Error: {submitError}</p>
                  </motion.div>
                )}

                <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                  <p className="text-yellow-300 text-sm font-body">
                    ⚠️ Important: After clicking "Send Order Request", our team will receive your order details and
                    contact you on Telegram to confirm payment and start your promotion.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {selectedItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700">
              <CardContent className="p-12">
                <div className="text-6xl mb-6">🛒</div>
                <h3 className="text-2xl font-subtitle text-white mb-4">Select Your Packages</h3>
                <p className="text-gray-400 font-body">
                  Choose from the packages above to see pricing and payment instructions
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
