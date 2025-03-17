import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { compare } from "bcrypt";

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
};
