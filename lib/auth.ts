import { NextRequest } from 'next/server'
import { verifyToken } from './auth-utils'
import connectDB from './db'
import { getUserModel } from './models/User'
import type { UserDocument } from './types'

export interface AuthUser {
  userId: string
  email: string
  username: string
}

/**
 * Extract and verify user from request (JWT from header or cookie)
 */
export async function getUserFromRequest(request: NextRequest): Promise<AuthUser> {
  let token: string | null = null

  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }

  // Fallback: try to get token from cookie
  if (!token) {
    token = request.cookies.get('token')?.value || null
  }

  if (!token) {
    throw new Error('No authentication token provided')
  }

  // Verify the token
  const decoded = verifyToken(token)
  if (!decoded) {
    throw new Error('Invalid authentication token')
  }

  // Connect to database and get user
  await connectDB()
  const User = getUserModel()
  const user = await User.findById(decoded.userId).select('-password')
  
  if (!user) {
    throw new Error('User not found')
  }

  const userDoc = user as unknown as UserDocument
  
  return {
    userId: userDoc._id.toString(),
    email: user.email,
    username: user.username
  }
}

/**
 * Wrapper for API routes that require authentication
 */
export function withAuth<T = any>(
  handler: (request: NextRequest, user: AuthUser, ...args: any[]) => Promise<Response>
) {
  return async (request: NextRequest, ...args: any[]): Promise<Response> => {
    try {
      const user = await getUserFromRequest(request)
      return await handler(request, user, ...args)
    } catch (error: any) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: { 
            code: 'UNAUTHORIZED', 
            message: error.message || 'Authentication required' 
          } 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
}