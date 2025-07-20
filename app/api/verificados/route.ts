import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "verificados.json")

    // ID do usuário sempre verificado (owner/admin)
    const adminUser = {
      user_id: 1575922939,
      walletAddress: "admin",
      telegramHandle: "Gforth",
      telegramUserId: "1575922939",
      shillBalance: 999999999,
      timestamp: new Date().toISOString(),
      isAdmin: true,
    }

    try {
      const fileContent = await fs.readFile(filePath, "utf-8")
      const fileData = JSON.parse(fileContent)

      // Combina dados do arquivo com o usuário admin
      const allData = [adminUser, ...fileData]

      console.log("Returning verified users:", allData.length)

      return NextResponse.json({
        success: true,
        data: allData,
        total: allData.length,
      })
    } catch {
      // File doesn't exist or is invalid, return only admin user
      console.log("File not found, returning only admin user")
      return NextResponse.json({
        success: true,
        data: [adminUser],
        total: 1,
      })
    }
  } catch (error) {
    console.error("Error reading verified users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
