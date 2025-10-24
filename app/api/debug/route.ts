import { NextResponse } from "next/server"

export async function GET() {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    message: "Debug endpoint - check browser console for localStorage info"
  }
  
  return NextResponse.json(debugInfo)
}