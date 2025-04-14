import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    role: string; // Добавляем поле role в User
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string; //  Добавляем role в Session
    };
  }

  interface JWT {
    role: string; // Добавляем role в JWT
  }
}
