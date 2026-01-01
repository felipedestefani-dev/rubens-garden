import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function verifyAuth() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value

    if (!token) {
      return { authenticated: false, user: null }
    }

    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    return {
      authenticated: true,
      user: {
        username: payload.username as string,
        role: payload.role as string,
      },
    }
  } catch (error) {
    return { authenticated: false, user: null }
  }
}



