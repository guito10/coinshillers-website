import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Fetching PEPU Unchained pools from GeckoTerminal...")

    const response = await fetch(
      "https://api.geckoterminal.com/api/v2/networks/pepe-unchained/pools?page=1&include=base_token,quote_token",
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      },
    )

    if (!response.ok) {
      throw new Error(`GeckoTerminal API error: ${response.status}`)
    }

    const data = await response.json()
    console.log(`📊 Found ${data.data?.length || 0} total pools`)

    if (!data.data || data.data.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        timestamp: new Date().toISOString(),
        source: "GeckoTerminal API",
        total_found: 0,
        debug_info: {
          total_pools: 0,
          parsing_method: "Pool name parsing",
          sample_parsing: [],
        },
      })
    }

    // Parse pool names to extract token symbols since the API doesn't provide them directly
    console.log("🔍 Parsing pool names to extract token symbols...")

    const parsePoolName = (poolName: string) => {
      // Pattern: "$PENK / WPEPU 0.01% (/)" or "MFG / WPEPU 1% (/)"
      const match = poolName.match(/^(\$?[A-Z0-9]+)\s*\/\s*([A-Z0-9]+)\s*[\d.]+%/i)
      if (match) {
        const baseSymbol = match[1].replace(/^\$/, "").toUpperCase() // Remove $ prefix if present and convert to uppercase
        const quoteSymbol = match[2].toUpperCase()
        return { baseSymbol, quoteSymbol }
      }
      return null
    }

    // Tokens to exclude (stablecoins, wrapped tokens, etc.)
    const excludedTokens = new Set(["WETH", "USDT", "USDC", "DAI", "BUSD", "FRAX", "TUSD"])

    // Process pools and look for WPEPU pairs
    const wpepuPools = []
    const seenTokens = new Set() // Track unique base tokens to avoid duplicates
    const sampleParsing = []

    for (const pool of data.data) {
      const poolName = pool.attributes?.name || ""
      const parsed = parsePoolName(poolName)

      // Add to sample parsing for debug
      if (sampleParsing.length < 15) {
        sampleParsing.push({
          original: poolName,
          parsed: parsed ? `${parsed.baseSymbol}/${parsed.quoteSymbol}` : "Failed to parse",
          is_wpepu: parsed?.quoteSymbol === "WPEPU",
        })
      }

      console.log(
        `🔍 Parsing pool: "${poolName}" → ${parsed ? `Base: "${parsed.baseSymbol}", Quote: "${parsed.quoteSymbol}"` : "Failed to parse"}`,
      )

      // Check if this is a WPEPU pair and not excluded
      if (parsed && parsed.quoteSymbol === "WPEPU" && !excludedTokens.has(parsed.baseSymbol)) {
        // Skip if we already have this base token (avoid duplicates)
        if (seenTokens.has(parsed.baseSymbol)) {
          console.log(`⚠️ Skipping duplicate token: ${parsed.baseSymbol}/WPEPU`)
          continue
        }

        seenTokens.add(parsed.baseSymbol)
        console.log(`✅ Found WPEPU pair: ${parsed.baseSymbol}/WPEPU`)

        const attributes = pool.attributes || {}
        const poolData = {
          id: pool.id,
          name: poolName,
          address: attributes.address || pool.id,
          volume_usd: Number.parseFloat(attributes.volume_usd?.h24 || "0"),
          liquidity_usd: Number.parseFloat(attributes.reserve_in_usd || "0"),
          base_token_price: Number.parseFloat(attributes.base_token_price_usd || "0"),
          quote_token_price: Number.parseFloat(attributes.quote_token_price_usd || "0"),
          price_change_24h: Number.parseFloat(attributes.price_change_percentage?.h24 || "0"),
          market_cap_usd: Number.parseFloat(attributes.market_cap_usd || "0"),
          fdv_usd: Number.parseFloat(attributes.fdv_usd || "0"),
          base_token_symbol: parsed.baseSymbol,
          quote_token_symbol: parsed.quoteSymbol,
          main_token_symbol: parsed.baseSymbol,
          wpepu_token_symbol: parsed.quoteSymbol,
          pool_created_at: attributes.pool_created_at || "",
          transactions_24h: attributes.transactions || {},
          is_wpepu_pair: true,
        }

        // Only include pools with minimum liquidity
        if (poolData.liquidity_usd >= 1) {
          wpepuPools.push(poolData)
        }
      }
    }

    console.log(`🏆 Found ${wpepuPools.length} unique WPEPU pairs after filtering`)

    // Sort by market cap first (highest first), then FDV, then liquidity
    wpepuPools.sort((a: any, b: any) => {
      // Primary: Market Cap
      if (a.market_cap_usd > 0 && b.market_cap_usd > 0) {
        return b.market_cap_usd - a.market_cap_usd
      }
      if (a.market_cap_usd > 0) return -1
      if (b.market_cap_usd > 0) return 1

      // Secondary: FDV
      if (a.fdv_usd > 0 && b.fdv_usd > 0) {
        return b.fdv_usd - a.fdv_usd
      }
      if (a.fdv_usd > 0) return -1
      if (b.fdv_usd > 0) return 1

      // Tertiary: Liquidity
      return b.liquidity_usd - a.liquidity_usd
    })

    const top5 = wpepuPools.slice(0, 5)

    console.log("🏆 Top 5 WPEPU pairs:")
    top5.forEach((pool: any, index: number) => {
      const metric =
        pool.market_cap_usd > 0
          ? `Market Cap: $${pool.market_cap_usd.toLocaleString()}`
          : pool.fdv_usd > 0
            ? `FDV: $${pool.fdv_usd.toLocaleString()}`
            : `Liquidity: $${pool.liquidity_usd.toLocaleString()}`
      console.log(`${index + 1}. ${pool.main_token_symbol}/WPEPU - ${metric}`)
    })

    return NextResponse.json({
      success: true,
      data: top5,
      timestamp: new Date().toISOString(),
      source: "GeckoTerminal API",
      filter: "WPEPU pairs only (excluding stablecoins and duplicates)",
      total_found: top5.length,
      debug_info: {
        total_pools: data.data.length,
        parsing_method: "Pool name parsing with duplicate removal",
        sample_parsing: sampleParsing,
      },
    })
  } catch (error: any) {
    console.error("❌ Error fetching WPEPU pairs:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch WPEPU pairs",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
