import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

interface VerifiedUser {
  walletAddress: string
  telegramHandle: string
  telegramUserId: string
  user_id: number
  shillBalance: number
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, telegramHandle, telegramUserId, shillBalance, timestamp } = body

    console.log("Received save request:", { walletAddress, telegramHandle, telegramUserId, shillBalance })

    // Validate required fields
    if (!walletAddress || !telegramHandle || !telegramUserId || !timestamp) {
      console.log("Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Clean telegram handle (remove @ if present)
    const cleanTelegramHandle = telegramHandle.startsWith("@") ? telegramHandle.slice(1) : telegramHandle

    // Convert telegramUserId to number
    const userIdNumber = Number.parseInt(telegramUserId, 10)
    if (isNaN(userIdNumber)) {
      console.log("Invalid telegram user ID")
      return NextResponse.json({ error: "Invalid telegram user ID" }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), "data", "verificados.json")

    // Ensure data directory exists
    const dataDir = path.dirname(filePath)
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }

    // Read existing data or create empty array
    let existingData: VerifiedUser[] = []
    try {
      const fileContent = await fs.readFile(filePath, "utf-8")
      existingData = JSON.parse(fileContent)
    } catch {
      // File doesn't exist or is invalid, start with empty array
      existingData = []
    }

    // Check if wallet already exists and update, or add new entry
    const existingIndex = existingData.findIndex(
      (user) => user.walletAddress.toLowerCase() === walletAddress.toLowerCase(),
    )

    const newUser: VerifiedUser = {
      walletAddress,
      telegramHandle: cleanTelegramHandle,
      telegramUserId: telegramUserId,
      user_id: userIdNumber,
      shillBalance,
      timestamp,
    }

    if (existingIndex >= 0) {
      // Update existing user
      existingData[existingIndex] = newUser
      console.log("Updated existing user")
    } else {
      // Add new user
      existingData.push(newUser)
      console.log("Added new user")
    }

    // Save updated data
    await fs.writeFile(filePath, JSON.stringify(existingData, null, 2))
    console.log("Data saved to file successfully")

    return NextResponse.json({
      success: true,
      message: "User verification saved successfully",
      data: newUser,
    })
  } catch (error) {
    console.error("Error saving verified user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
