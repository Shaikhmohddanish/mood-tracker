import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import { getUserModel } from "@/lib/models/User"
import { hashPassword, generateToken } from "@/lib/auth-utils"
import type { UserDocument } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()
    const User = getUserModel()

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username'
      return NextResponse.json({ 
        error: `User with this ${field} already exists` 
      }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    })

    const savedUser = await newUser.save()

    const userDoc = savedUser as unknown as UserDocument
    
    // Generate JWT token
    const token = generateToken(userDoc._id.toString())

    // Return user data (without password)
    const userData = {
      id: userDoc._id.toString(),
      username: savedUser.username,
      email: savedUser.email
    }

    return NextResponse.json({
      token,
      user: userData,
    })

  } catch (error: any) {
    console.error("Registration error:", error)
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errorMessage = Object.values(error.errors)[0] as any
      return NextResponse.json({ error: errorMessage.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
