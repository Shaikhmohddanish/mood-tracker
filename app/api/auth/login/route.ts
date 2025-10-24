import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import { getUserModel } from "@/lib/models/User"
import { comparePassword, generateToken } from "@/lib/auth-utils"
import type { UserDocument } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()
    const User = getUserModel()

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const userDoc = user as unknown as UserDocument
    
    // Generate JWT token
    const token = generateToken(userDoc._id.toString())

    // Return user data (without password)
    const userData = {
      id: userDoc._id.toString(),
      username: user.username,
      email: user.email
    }

    return NextResponse.json({
      token,
      user: userData,
    })

  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
