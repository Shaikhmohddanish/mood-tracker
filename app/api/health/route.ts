import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"

export async function GET() {
  try {
    await connectToDatabase()
    return NextResponse.json({ status: "Database connected successfully" })
  } catch (error: any) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      { error: "Database connection failed", details: error.message }, 
      { status: 500 }
    )
  }
}