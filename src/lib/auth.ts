import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { randomBytes, pbkdf2Sync, timingSafeEqual } from "crypto"

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":")
  const computed = pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  try {
    const a = Buffer.from(hash, "hex")
    const b = Buffer.from(computed, "hex")
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

// Demo users (in-memory - replace with Prisma in production)
const demoUsers: Record<string, { name: string; email: string; password: string }> = {
  "demo@nervsignal.com": {
    name: "Demo User",
    email: "demo@nervsignal.com",
    password: hashPassword("demo123"),
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const email = (credentials.email as string).toLowerCase().trim()
        const user = demoUsers[email]
        if (!user || !verifyPassword(credentials.password as string, user.password)) {
          return null
        }
        return { id: email, name: user.name, email: user.email }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (session.user) (session.user as any).id = token.id
      return session
    },
  },
})
