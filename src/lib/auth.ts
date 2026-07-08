import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';

// Simple password verification - supports both plain text and bcrypt hashed passwords
async function verifyPassword(plainPassword: string, storedPassword: string): Promise<boolean> {
  // Direct match (plain text or already compared)
  if (plainPassword === storedPassword) return true;
  
  // Try bcrypt comparison if it looks like a hash
  if (storedPassword.startsWith('$2')) {
    try {
      const bcrypt = await import('bcryptjs');
      return await bcrypt.compare(plainPassword, storedPassword);
    } catch {
      return false;
    }
  }
  
  return false;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET || 'campusos-v2-secret-key-2024',
};
