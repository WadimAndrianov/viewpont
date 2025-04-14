import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> } // Делаем params асинхронным
) {
  const resolvedParams = await context.params; // Ждём разрешения промиса
  const productId = Number(resolvedParams.id); // Теперь можно получить category

  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      reviews: {
        include: {
          user: { select: { username: true } }, // Подгружаем имя автора отзыва
        },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Продукт не найден" }, { status: 404 });
  }

  return NextResponse.json(product);
}

// Функция удаления продукта
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const productId = Number(resolvedParams.id);

    // Проверяем, существует ли продукт
    const existingProduct = await db.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Продукт не найден" }, { status: 404 });
    }

    // Удаляем продукт
    await db.product.delete({
      where: { id: productId },
    });

    return NextResponse.json(
      { message: "Продукт успешно удалён" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка удаления продукта:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
