"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Copy, Check } from "lucide-react"
import Link from "next/link"

const FONT_OPTIONS = [
  {
    name: "Bebas Neue",
    googleFont: "Bebas+Neue:wght@400",
    cssClass: "bebas-neue",
    description: "Condensed, modern, similar to Lemon Milk",
    category: "Display",
  },
  {
    name: "Oswald",
    googleFont: "Oswald:wght@400;500;600;700",
    cssClass: "oswald",
    description: "Bold condensed, great for headers",
    category: "Sans-serif",
  },
  {
    name: "Anton",
    googleFont: "Anton:wght@400",
    cssClass: "anton",
    description: "Ultra bold, high impact",
    category: "Display",
  },
  {
    name: "Fjalla One",
    googleFont: "Fjalla+One:wght@400",
    cssClass: "fjalla-one",
    description: "Condensed, clean, modern",
    category: "Sans-serif",
  },
  {
    name: "Russo One",
    googleFont: "Russo+One:wght@400",
    cssClass: "russo-one",
    description: "Futuristic, tech style",
    category: "Display",
  },
  {
    name: "Squada One",
    googleFont: "Squada+One:wght@400",
    cssClass: "squada-one",
    description: "Bold, geometric, modern",
    category: "Display",
  },
  {
    name: "Orbitron",
    googleFont: "Orbitron:wght@400;700;900",
    cssClass: "orbitron",
    description: "Sci-fi, futuristic, geometric",
    category: "Sans-serif",
  },
  {
    name: "Exo 2",
    googleFont: "Exo+2:wght@400;700;900",
    cssClass: "exo-2",
    description: "Modern, tech, versatile",
    category: "Sans-serif",
  },
  {
    name: "Rajdhani",
    googleFont: "Rajdhani:wght@400;500;600;700",
    cssClass: "rajdhani",
    description: "Condensed, clean, readable",
    category: "Sans-serif",
  },
  {
    name: "Teko",
    googleFont: "Teko:wght@400;500;600;700",
    cssClass: "teko",
    description: "Ultra condensed, modern",
    category: "Sans-serif",
  },
  {
    name: "Audiowide",
    googleFont: "Audiowide:wght@400",
    cssClass: "audiowide",
    description: "Retro-futuristic, wide",
    category: "Display",
  },
  {
    name: "Michroma",
    googleFont: "Michroma:wght@400",
    cssClass: "michroma",
    description: "Geometric, tech, bold",
    category: "Display",
  },
]

const SAMPLE_TEXTS = [
  "CoinShillers",
  "The Army of Shillers Never Sleeps",
  "FUEL THE GROWTH",
  "VELVET ROOM",
  "Buy $SHILL Now",
  "Connect Wallet",
  "ECOSYSTEM DOMINATION",
]

export default function FontPreviewPage() {
  const [selectedFont, setSelectedFont] = useState<string | null>(null)
  const [copiedFont, setCopiedFont] = useState<string | null>(null)

  const copyFontCode = (fontName: string, googleFont: string, cssClass: string) => {
    const code = `
// Add to ClientLayout.tsx
import { ${fontName.replace(/\s+/g, "_")} } from "next/font/google"

const ${cssClass.replace(/-/g, "")} = ${fontName.replace(/\s+/g, "_")}({
  subsets: ["latin"],
  variable: "--font-${cssClass}",
  weight: ["400", "700"],
  display: "swap",
})

// Add to globals.css
.font-display {
  font-family: var(--font-${cssClass}), sans-serif;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
    `.trim()

    navigator.clipboard.writeText(code)
    setCopiedFont(fontName)
    setTimeout(() => setCopiedFont(null), 2000)
  }

  return (
    <>
      {/* Dynamic Google Fonts Loading */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?${FONT_OPTIONS.map((font) => font.googleFont).join("&")}&display=swap');
        
        .bebas-neue { font-family: 'Bebas Neue', cursive; }
        .oswald { font-family: 'Oswald', sans-serif; }
        .anton { font-family: 'Anton', sans-serif; }
        .fjalla-one { font-family: 'Fjalla One', sans-serif; }
        .russo-one { font-family: 'Russo One', sans-serif; }
        .squada-one { font-family: 'Squada One', cursive; }
        .orbitron { font-family: 'Orbitron', sans-serif; }
        .exo-2 { font-family: 'Exo 2', sans-serif; }
        .rajdhani { font-family: 'Rajdhani', sans-serif; }
        .teko { font-family: 'Teko', sans-serif; }
        .audiowide { font-family: 'Audiowide', cursive; }
        .michroma { font-family: 'Michroma', sans-serif; }
      `}</style>

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
                <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full">
                  <span className="text-white text-xl">🎨</span>
                </div>
                <span className="text-xl font-bold text-gray-900 uppercase">Font Preview</span>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">🎨 Choose Your Perfect Font</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Preview different fonts similar to Lemon Milk and see how they look with your CoinShillers content. Click
              on any font to see more details and copy the implementation code.
            </p>
          </motion.div>

          {/* Font Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {FONT_OPTIONS.map((font, index) => (
              <motion.div
                key={font.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`bg-white border-gray-200 hover:border-blue-300 transition-all duration-300 cursor-pointer ${
                    selectedFont === font.name ? "ring-2 ring-blue-500 border-blue-500" : ""
                  }`}
                  onClick={() => setSelectedFont(selectedFont === font.name ? null : font.name)}
                >
                  <CardContent className="p-6">
                    {/* Font Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{font.name}</h3>
                        <p className="text-sm text-gray-500">
                          {font.category} • {font.description}
                        </p>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyFontCode(font.name, font.googleFont, font.cssClass)
                        }}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        {copiedFont === font.name ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Font Samples */}
                    <div className="space-y-4">
                      {SAMPLE_TEXTS.map((text, textIndex) => (
                        <div key={textIndex} className="border-b border-gray-100 pb-3 last:border-b-0">
                          <div
                            className={`${font.cssClass} text-gray-900 font-bold uppercase tracking-wide transition-all duration-300 hover:text-blue-600`}
                            style={{
                              fontSize: textIndex === 0 ? "2rem" : textIndex === 1 ? "1.5rem" : "1.25rem",
                              lineHeight: "1.2",
                            }}
                          >
                            {text}
                          </div>
                          {textIndex === 0 && <div className="mt-2 text-xs text-gray-400">Main Logo/Brand Text</div>}
                        </div>
                      ))}
                    </div>

                    {/* Expanded Details */}
                    {selectedFont === font.name && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-6 border-t border-gray-200"
                      >
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2">Font Weights Available:</h4>
                            <div className="flex flex-wrap gap-2">
                              {font.googleFont.includes("400") && (
                                <span className="px-2 py-1 bg-gray-100 rounded text-xs">Regular (400)</span>
                              )}
                              {font.googleFont.includes("500") && (
                                <span className="px-2 py-1 bg-gray-100 rounded text-xs">Medium (500)</span>
                              )}
                              {font.googleFont.includes("600") && (
                                <span className="px-2 py-1 bg-gray-100 rounded text-xs">SemiBold (600)</span>
                              )}
                              {font.googleFont.includes("700") && (
                                <span className="px-2 py-1 bg-gray-100 rounded text-xs">Bold (700)</span>
                              )}
                              {font.googleFont.includes("900") && (
                                <span className="px-2 py-1 bg-gray-100 rounded text-xs">Black (900)</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-bold text-gray-900 mb-2">Best Use Cases:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Headers and titles</li>
                              <li>• Logo and branding</li>
                              <li>• Call-to-action buttons</li>
                              <li>• Navigation menus</li>
                            </ul>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-bold text-gray-900 mb-2">Implementation Preview:</h4>
                            <pre className="text-xs text-gray-600 overflow-x-auto">
                              {`// In ClientLayout.tsx
const ${font.cssClass.replace(/-/g, "")} = ${font.name.replace(/\s+/g, "_")}({
  subsets: ["latin"],
  variable: "--font-${font.cssClass}",
  display: "swap",
})`}
                            </pre>
                          </div>
                        </div>
                      </motion.div>
                    )}
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
            className="mt-12 max-w-4xl mx-auto"
          >
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-4">📋 How to Use:</h3>
                <div className="space-y-3 text-blue-800">
                  <p>
                    <strong>1.</strong> Browse the fonts above and see how they look with your content
                  </p>
                  <p>
                    <strong>2.</strong> Click on any font card to see more details and weights available
                  </p>
                  <p>
                    <strong>3.</strong> Click "Copy Code" to get the implementation code
                  </p>
                  <p>
                    <strong>4.</strong> Tell me which font you prefer and I'll implement it for you!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  )
}
