import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { projectName, packages, totalPrice, telegramUsername } = await request.json()

    console.log("📨 Received order request:", { projectName, packages, totalPrice, telegramUsername })

    if (!projectName || !packages || packages.length === 0 || !telegramUsername) {
      console.error("❌ Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const packageNames = packages.map((item: any) => item.name).join(", ")
    const walletAddress = "0x80BC9DE9806D82D0A0A0e3Bc54af98dE6eA64E77"

    const message = `🚀 NEW ORDER RECEIVED!

📌 Project: ${projectName.trim()}
🎯 Packages: ${packageNames}
💰 Total: $${totalPrice}
👤 Telegram: ${telegramUsername.startsWith("@") ? telegramUsername : "@" + telegramUsername}
💳 Payment Address: ${walletAddress}

⚠️ Please confirm payment to start promotion.`

    // Bot Token e Chat ID (você precisa verificar se estão corretos)
    const botToken = "7907613402:AAEnZSQY4Gzi5zZWKplKPgorOahWEgpmW_M"
    const chatId = "-1002687050237"

    console.log("📤 Sending to Telegram:", { botToken: botToken.substring(0, 10) + "...", chatId })

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`

    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    })

    console.log("📡 Telegram API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Telegram API error response:", errorText)

      // Tentar parsear o erro
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { description: errorText }
      }

      // Retornar erro mais específico
      return NextResponse.json(
        {
          error: `Telegram API Error: ${errorData.description || "Unknown error"}`,
          details: errorData,
        },
        { status: response.status },
      )
    }

    const result = await response.json()
    console.log("✅ Telegram message sent successfully:", result)

    return NextResponse.json({
      success: true,
      message: "Order sent to Telegram successfully!",
      result,
    })
  } catch (error: any) {
    console.error("❌ Server error:", error)
    return NextResponse.json(
      {
        error: `Server error: ${error.message}`,
        details: error.stack,
      },
      { status: 500 },
    )
  }
}
