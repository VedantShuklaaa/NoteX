import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });

          if (!existingUser) {
            // Create new user from Google
            await prisma.user.create({
              data: {
                email: user.email!,
                displayName: user.name || profile?.name as string,
                password: "", // No password for Google users
                provider: "google",
              }
            });
          } else if (existingUser.provider !== "google") {
            // User exists with email/password, link Google account
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                provider: "google",
              }
            });
          }
          
          return true;
        } catch (error) {
          console.error("Error in Google sign in:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.email = token.sub!;
        
        // Fetch user from database to get latest data
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub! }
        });
        
        if (dbUser) {
          session.user.name = dbUser.displayName;
          session.user.email = dbUser.email;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };