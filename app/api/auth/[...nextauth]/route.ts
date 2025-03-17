import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
