import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { compare } from "bcryptjs"; // Заменяем bcrypt на bcryptjs

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "Имя", type: "text", placeholder: "Ваше имя" },
        password: {
          label: "Пароль",
          type: "password",
          placeholder: "Введите пароль",
        },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.password) {
          throw new Error("EMPTY_FIELDS");
        }

        const existingUser = await db.user.findUnique({
          where: { username: credentials.name }, // ищем по username
        });

        if (!existingUser) {
          throw new Error("USER_NOT_FOUND");
        }

        const passwordMatch = await compare(
          credentials.password,
          existingUser.password
        );

        if (!passwordMatch) {
          throw new Error("WRONG_PASSWORD");
        }

        return {
          id: `${existingUser.id}`,
          name: existingUser.username,
          email: existingUser.email,
          role: existingUser?.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // Добавляем role в JWT
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string; // Передаём role в session
        session.user.id = token.id as string; // Убедись, что id передаётся
      }
      return session;
    },
  },
};
