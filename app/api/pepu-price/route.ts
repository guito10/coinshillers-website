import { NextResponse } from "next/server"

// CoinMarketCap API configuration
const COINMARKETCAP_API_BASE = "https://pro-api.coinmarketcap.com/v1"
// Use a variável de ambiente para a chave da API em produção
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "YOUR_DEFAULT_API_KEY_HERE" // Substitua pela sua chave real ou use a variável de ambiente
const PEPU_CMC_ID = "36696" // UCID para Pepe Unchained no CoinMarketCap

export async function GET() {
  try {
    console.log(`🔍 [API Route] Fetching PEPU price from CoinMarketCap (ID: ${PEPU_CMC_ID})...`)

    if (!COINMARKETCAP_API_KEY || COINMARKETCAP_API_KEY === "YOUR_DEFAULT_API_KEY_HERE") {
      console.error("❌ [API Route] COINMARKETCAP_API_KEY is not set. Please set it as an environment variable.")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const response = await fetch(`${COINMARKETCAP_API_BASE}/cryptocurrency/quotes/latest?id=${PEPU_CMC_ID}`, {
      headers: {
        "X-CMC_PRO_API_KEY": COINMARKETCAP_API_KEY,
        Accept: "application/json",
      },
      // Adicione cache para evitar chamadas excessivas à API externa
      next: { revalidate: 60 }, // Revalida a cada 60 segundos
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [API Route] CoinMarketCap API error: ${response.status} ${response.statusText} - ${errorText}`)
      return NextResponse.json(
        { error: `Failed to fetch PEPU price: ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("📊 [API Route] CoinMarketCap response:", data)

    if (data.data && data.data[PEPU_CMC_ID] && data.data[PEPU_CMC_ID].quote && data.data[PEPU_CMC_ID].quote.USD) {
      const price = Number.parseFloat(data.data[PEPU_CMC_ID].quote.USD.price)
      console.log(`✅ [API Route] PEPU price fetched: $${price}`)
      return NextResponse.json({ pepuPriceUsd: price })
    }

    console.log("⚠️ [API Route] CoinMarketCap response did not contain price data for PEPU.")
    return NextResponse.json({ pepuPriceUsd: 0, message: "Price data not found" }, { status: 200 })
  } catch (err: any) {
    console.error("❌ [API Route] Error fetching PEPU price from CoinMarketCap:", err)
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}
