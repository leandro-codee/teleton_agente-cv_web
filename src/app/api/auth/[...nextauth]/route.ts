import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// types/next-auth.d.ts - Extensión de tipos para NextAuth
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user: {
      id: string
    } & DefaultSession['user']
  }

  interface User {
    accessToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
  }
}