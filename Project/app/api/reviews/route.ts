import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Вы не авторизованы." },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id as string, 10);

    if (isNaN(userId)) {
      throw new Error("Некорректный userId");
    }

    const { productId, content, rating } = await request.json();

    if (!productId || !content.trim() || rating < 1 || rating > 5) {
      throw new Error("Некорректные данные. Проверьте заполненные поля.");
    }

    const existingReview = await db.review.findFirst({
      where: {
        userId: userId,
        productId: Number(productId),
      },
    });

    if (existingReview) {
      throw new Error("Вы уже оставляли отзыв на этот продукт");
    }
    const newReview = await db.review.create({
      data: {
        content,
        rating,
        createdAt: new Date(),
        user: { connect: { id: userId } },
        product: { connect: { id: Number(productId) } },
      },
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
