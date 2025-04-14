import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> } // Делаем params асинхронным
) {
  try {
    const resolvedParams = await context.params; // Ждём разрешения промиса
    const reviewId = Number(resolvedParams.id);

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Вы не авторизованы." },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id as string, 10);

    if (isNaN(reviewId) || isNaN(userId)) {
      throw new Error("Некорректные данные.");
    }

    // Проверяем, принадлежит ли отзыв пользователю
    const review = await db.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: "Отзыв не найден." }, { status: 404 });
    }

    if (review.userId !== userId) {
      return NextResponse.json(
        { error: "Вы не можете удалить чужой отзыв." },
        { status: 403 }
      );
    }

    await db.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ message: "Отзыв удален." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
