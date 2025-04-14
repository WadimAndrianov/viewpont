import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { sendEmail } from "@/app/lib/emailSend";

const userSchema = z.object({
  name: z.string().min(5, "Имя должно содержать минимум 5 символов"),
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export async function GET() {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, password } = userSchema.parse(body);

    const existingUserByEmail = await db.user.findUnique({
      where: { email: email },
    });
    if (existingUserByEmail) {
      return NextResponse.json(
        {
          user: null,
          message: "Пользователь с такой почтой уже сущесвтует",
        },
        { status: 409 }
      );
    }

    const existingUserByUsername = await db.user.findUnique({
      where: { username: name },
    });
    if (existingUserByUsername) {
      return NextResponse.json(
        {
          user: null,
          message: "Пользователь с таким именем уже сущесвтует",
        },
        { status: 409 }
      );
    }

    // Хэширование пароля с помощью bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        username: name,
        email: email,
        password: hashedPassword,
      },
    });

    const { password: newUserPassword, ...rest } = newUser;

    return NextResponse.json(
      { user: rest, message: "Пользователь успешно создан" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}

// Обновление данных пользователя
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { email, newName, newPassword } = body;

    if (!email || !newName || !newPassword) {
      return NextResponse.json(
        { message: "Заполните все поля" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { message: "Пользователь с таким email не найден" },
        { status: 404 }
      );
    }

    const userByName = await db.user.findUnique({
      where: { username: newName },
    });

    if (userByName) {
      return NextResponse.json(
        { message: "Пользователь с таким именем уже существует" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await db.user.update({
      where: { email },
      data: { username: newName, password: hashedPassword },
    });

    const { password: _, ...rest } = updatedUser;

    // Отправляем email без fetch-запроса
    await sendEmail(email, newName, newPassword);

    return NextResponse.json(
      { user: rest, message: "Данные пользователя успешно обновлены" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}
