"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Copy, Check, Wallet, Rocket, ExternalLink, Sparkles } from "lucide-react"
import Link from "next/link"

const GRADIENT_OPTIONS = [
  {
    name: "Fire Sunset",
    gradient: "from-orange-500 to-red-500",
    hover: "from-orange-600 to-red-600",
    description: "Hot and energetic",
    category: "Warm",
  },
  {
    name: "Purple Dream",
    gradient: "from-purple-600 to-pink-500",
    hover: "from-purple-700 to-pink-600",
    description: "Modern and vibrant",
    category: "Cool",
  },
  {
    name: "Ocean Deep",
    gradient: "from-blue-800 to-cyan-500",
    hover: "from-blue-900 to-cyan-600",
    description: "Professional and reliable",
    category: "Cool",
  },
  {
    name: "Neon Cyber",
    gradient: "from-green-400 to-blue-500",
    hover: "from-green-500 to-blue-600",
    description: "Futuristic and tech",
    category: "Tech",
  },
  {
    name: "Golden Hour",
    gradient: "from-yellow-400 to-orange-500",
    hover: "from-yellow-500 to-orange-600",
    description: "Luxurious and premium",
    category: "Warm",
  },
  {
    name: "Royal Purple",
    gradient: "from-indigo-600 to-purple-600",
    hover: "from-indigo-700 to-purple-700",
    description: "Elegant and sophisticated",
    category: "Cool",
  },
  {
    name: "Mint Fresh",
    gradient: "from-emerald-400 to-teal-500",
    hover: "from-emerald-500 to-teal-600",
    description: "Fresh and natural",
    category: "Cool",
  },
  {
    name: "Cosmic Pink",
    gradient: "from-pink-500 to-rose-500",
    hover: "from-pink-600 to-rose-600",
    description: "Creative and bold",
    category: "Warm",
  },
  {
    name: "Electric Blue",
    gradient: "from-blue-500 to-indigo-600",
    hover: "from-blue-600 to-indigo-700",
    description: "Dynamic and powerful",
    category: "Cool",
  },
  {
    name: "Sunset Glow",
    gradient: "from-red-400 to-pink-600",
    hover: "from-red-500 to-pink-700",
    description: "Romantic and warm",
    category: "Warm",
  },
  {
    name: "Matrix Green",
    gradient: "from-green-500 to-emerald-600",
    hover: "from-green-600 to-emerald-700",
    description: "Tech and hacker",
    category: "Tech",
  },
  {
    name: "Violet Storm",
    gradient: "from-violet-500 to-purple-700",
    hover: "from-violet-600 to-purple-800",
    description: "Mysterious and intense",
    category: "Cool",
  },
  {
    name: "Amber Flame",
    gradient: "from-amber-400 to-red-500",
    hover: "from-amber-500 to-red-600",
    description: "Energetic and motivating",
    category: "Warm",
  },
  {
    name: "Ice Crystal",
    gradient: "from-cyan-400 to-blue-600",
    hover: "from-cyan-500 to-blue-700",
    description: "Clean and crystalline",
    category: "Cool",
  },
  {
    name: "Neon Lime",
    gradient: "from-lime-400 to-green-500",
    hover: "from-lime-500 to-green-600",
    description: "Vibrant and eye-catching",
    category: "Tech",
  },
  {
    name: "Magenta Burst",
    gradient: "from-fuchsia-500 to-pink-600",
    hover: "from-fuchsia-600 to-pink-700",
    description: "Bold and creative",
    category: "Warm",
  },
]

const BUTTON_TYPES = [
  {
    name: "Connect Wallet",
    icon: <Wallet className="w-4 h-4 mr-2" />,
    text: "CONNECT WALLET",
    size: "default" as const,
  },
  {
    name: "Buy on PumpPad",
    icon: <Rocket className="w-5 h-5 mr-2" />,
    text: "Buy $SHILL on PumpPad",
    extraIcon: <ExternalLink className="w-4 h-4 ml-2" />,
    size: "lg" as const,
  },
  {
    name: "Buy Now",
    icon: <Sparkles className="w-5 h-5 mr-2" />,
    text: "Buy $SHILL Now",
    size: "lg" as const,
  },
]

export default function ButtonPreviewPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [copiedGradient, setCopiedGradient] = useState<string | null>(null)
  const [selectedGradients, setSelectedGradients] = useState({
    connectWallet: "from-blue-800 to-cyan-500",
    buyPumpPad: "from-blue-800 to-cyan-500",
    buyNow: "from-blue-800 to-cyan-500",
  })

  const categories = ["All", "Warm", "Cool", "Tech"]

  const filteredGradients =
    selectedCategory === "All" ? GRADIENT_OPTIONS : GRADIENT_OPTIONS.filter((g) => g.category === selectedCategory)

  const copyGradientCode = (gradient: any) => {
    const code = `
// CSS Classes
className="bg-gradient-to-r ${gradient.gradient} hover:${gradient.hover} text-white border-0 shadow-lg"

// Tailwind Config (if needed)
// Add to your tailwind.config.js if using custom colors
    `.trim()

    navigator.clipboard.writeText(code)
    setCopiedGradient(gradient.name)
    setTimeout(() => setCopiedGradient(null), 2000)
  }

  const applyGradient = (buttonType: string, gradient: string, hover: string) => {
    setSelectedGradients((prev) => ({
      ...prev,
      [buttonType]: gradient,
    }))
  }

  const getHoverGradient = (gradient: string) => {
    const option = GRADIENT_OPTIONS.find((g) => g.gradient === gradient)
    return option?.hover || gradient.replace(/-(400|500)/g, "-600").replace(/-(600)/g, "-700")
  }

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
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <span className="text-white text-xl">🎨</span>
              </div>
              <span className="text-xl font-bold text-gray-900 uppercase">Button Gradients</span>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">🌈 Gradient Button Preview</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Teste diferentes gradientes para os botões do CoinShillers. Clique em qualquer gradiente para aplicar aos
            botões de exemplo.
          </p>
        </motion.div>

        {/* Current Button Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="bg-white border-gray-100 shadow-xl">
            <CardHeader>
              <CardTitle className="text-center">
                <span className="text-2xl font-bold text-gray-900">🎯 Current Button Styles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {BUTTON_TYPES.map((buttonType, index) => (
                  <div key={buttonType.name} className="text-center space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">{buttonType.name}</h3>
                    <Button
                      size={buttonType.size}
                      className={`bg-gradient-to-r ${
                        buttonType.name === "Connect Wallet"
                          ? selectedGradients.connectWallet
                          : buttonType.name === "Buy on PumpPad"
                            ? selectedGradients.buyPumpPad
                            : selectedGradients.buyNow
                      } hover:${getHoverGradient(
                        buttonType.name === "Connect Wallet"
                          ? selectedGradients.connectWallet
                          : buttonType.name === "Buy on PumpPad"
                            ? selectedGradients.buyPumpPad
                            : selectedGradients.buyNow,
                      )} text-white border-0 shadow-lg font-button transition-all duration-300 transform hover:scale-105`}
                    >
                      {buttonType.icon}
                      {buttonType.text}
                      {buttonType.extraIcon}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex justify-center space-x-4">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`font-button ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {category === "All" ? "🌈" : category === "Warm" ? "🔥" : category === "Cool" ? "❄️" : "⚡"} {category}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Gradient Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGradients.map((gradient, index) => (
            <motion.div
              key={gradient.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-white border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg group">
                <CardContent className="p-6 space-y-4">
                  {/* Gradient Preview */}
                  <div
                    className={`h-20 w-full rounded-xl bg-gradient-to-r ${gradient.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  ></div>

                  {/* Gradient Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">{gradient.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          gradient.category === "Warm"
                            ? "bg-orange-100 text-orange-700"
                            : gradient.category === "Cool"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {gradient.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{gradient.description}</p>
                  </div>

                  {/* Button Examples */}
                  <div className="space-y-3">
                    <Button
                      size="sm"
                      className={`w-full bg-gradient-to-r ${gradient.gradient} hover:${gradient.hover} text-white border-0 shadow-md font-button transition-all duration-300`}
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </Button>

                    <Button
                      size="sm"
                      className={`w-full bg-gradient-to-r ${gradient.gradient} hover:${gradient.hover} text-white border-0 shadow-md font-button transition-all duration-300`}
                    >
                      <Rocket className="w-4 h-4 mr-2" />
                      Buy $SHILL
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => copyGradientCode(gradient)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 font-button"
                    >
                      {copiedGradient === gradient.name ? (
                        <>
                          <Check className="w-4 h-4 mr-1 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => applyGradient("connectWallet", gradient.gradient, gradient.hover)}
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 font-button"
                      title="Apply to Connect Wallet"
                    >
                      🔗
                    </Button>

                    <Button
                      onClick={() => applyGradient("buyPumpPad", gradient.gradient, gradient.hover)}
                      variant="outline"
                      size="sm"
                      className="border-purple-200 text-purple-700 hover:bg-purple-50 font-button"
                      title="Apply to Buy PumpPad"
                    >
                      🚀
                    </Button>

                    <Button
                      onClick={() => applyGradient("buyNow", gradient.gradient, gradient.hover)}
                      variant="outline"
                      size="sm"
                      className="border-green-200 text-green-700 hover:bg-green-50 font-button"
                      title="Apply to Buy Now"
                    >
                      ✨
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">🎨 How to Use</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-blue-800">📋 Instructions:</h4>
                  <ul className="space-y-2 text-blue-700">
                    <li>
                      <strong>1.</strong> Browse gradients using category filters
                    </li>
                    <li>
                      <strong>2.</strong> Click 🔗🚀✨ buttons to apply to example buttons
                    </li>
                    <li>
                      <strong>3.</strong> Use "Copy" to copy the gradient CSS code
                    </li>
                    <li>
                      <strong>4.</strong> Test different combinations on preview buttons
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-blue-800">🎯 Design Tips:</h4>
                  <ul className="space-y-2 text-blue-700">
                    <li>
                      <strong>Warm:</strong> Energetic, call-to-action, urgency
                    </li>
                    <li>
                      <strong>Cool:</strong> Professional, reliable, tech
                    </li>
                    <li>
                      <strong>Tech:</strong> Futuristic, innovative, crypto
                    </li>
                    <li>
                      <strong>Contrast:</strong> Use different colors for each button type
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Selection Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">📝 Current Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-gray-700">Connect Wallet:</p>
                  <code className="text-xs bg-white px-2 py-1 rounded border">from-blue-800 to-cyan-500</code>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-700">Buy PumpPad:</p>
                  <code className="text-xs bg-white px-2 py-1 rounded border">from-blue-800 to-cyan-500</code>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-700">Buy Now:</p>
                  <code className="text-xs bg-white px-2 py-1 rounded border">from-blue-800 to-cyan-500</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
