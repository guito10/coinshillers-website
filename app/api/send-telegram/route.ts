import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { projectName, packages, totalPrice, telegramUsername } = await request.json()

    if (!projectName || !packages || packages.length === 0 || !telegramUsername) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const packageNames = packages.map((item: any) => item.name).join(", ")
    const walletAddress = "0x80BC9DE9806D82D0A0A0e3Bc54af98dE6eA64E77"

    const message = `📢 New order received!

📌 Project: ${projectName.trim()}
🎯 Package: ${packageNames}
💰 Amount: $${totalPrice}
👤 Telegram: ${telegramUsername.startsWith("@") ? telegramUsername : "@" + telegramUsername}
💳 Pay to: ${walletAddress} (PEPU)`

    const botToken = "7907613402:AAEnZSQY4Gzi5zZWKplKPgorOahWEgpmW_M"
    const chatId = "-1002687050237"

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Telegram API error:", errorData)
      throw new Error(`Telegram API error: ${response.status}`)
    }

    const result = await response.json()
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error sending to Telegram:", error)
    return NextResponse.json({ error: "Failed to send message to Telegram" }, { status: 500 })
  }
}
