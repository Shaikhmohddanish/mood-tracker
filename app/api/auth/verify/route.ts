import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import { getUserModel } from "@/lib/models/User"
import { verifyToken } from "@/lib/auth-utils"
import type { UserDocument } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('Authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authorization.split(' ')[1]
    
    // Verify token
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Connect to database
    await connectToDatabase()
    const User = getUserModel()

    // Find user
    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userDoc = user as unknown as UserDocument
    
    // Return user data
    const userData = {
      id: userDoc._id.toString(),
      username: user.username,
      email: user.email
    }

    return NextResponse.json({ user: userData })

  } catch (error: any) {
    console.error("Verify token error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}