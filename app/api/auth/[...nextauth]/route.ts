import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Configure users via environment variables (credentials stay in .env.local, not in code)
type ValidUser = { id: string; name: string; username: string; email: string; password: string }

const VALID_USERS: ValidUser[] = [
  {
    id: '1',
    name: process.env.ADMIN_NAME || 'Admin',
    username: process.env.ADMIN_USERNAME || 'admin',
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'changeme'
  },
  // Additional user (only active when env vars are set)
  ...(process.env.USER2_USERNAME ? [{
    id: '2',
    name: process.env.USER2_NAME || process.env.USER2_USERNAME,
    username: process.env.USER2_USERNAME,
    email: process.env.USER2_EMAIL || `${process.env.USER2_USERNAME}@example.com`,
    password: process.env.USER2_PASSWORD || '',
  }] : []) as ValidUser[],
]

if (!process.env.NEXTAUTH_SECRET) {
  console.warn('⚠️  NEXTAUTH_SECRET is not set. Please set it in your environment variables.')
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'admin' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = VALID_USERS.find(
          u => u.username === credentials.username && u.password === credentials.password
        )

        if (user) {
          return { id: user.id, name: user.name, email: user.email }
        }

        return null
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
