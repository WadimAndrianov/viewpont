import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function POST(req: Request) {
  const { name, description, imageUrl, category } = await req.json();

  // Находим категорию по имени
  const categoryData = await db.category.findUnique({
    where: { name: category },
  });

  if (!categoryData) {
    return NextResponse.json(
      { error: "Категория не найдена" },
      { status: 404 }
    );
  }

  const newProduct = await db.product.create({
    data: {
      name,
      description,
      imageUrl,
      category: { connect: { id: categoryData.id } },
    },
  });

  return NextResponse.json(newProduct, { status: 201 });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ category: string }> } // Делаем params асинхронным
) {
  const resolvedParams = await context.params; // Ждём разрешения промиса
  const categoryName = resolvedParams.category; // Теперь можно получить category

  const category = await db.category.findUnique({
    where: { name: categoryName },
    include: {
      products: {
        include: {
          reviews: true, // Чтобы посчитать средний рейтинг
        },
      },
    },
  });

  if (!category) {
    return NextResponse.json(
      { error: "Категория не найдена" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    category.products.map((product) => ({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      reviewCount: product.reviews.length,
      averageRating:
        product.reviews.length > 0
          ? (
              product.reviews.reduce((sum, review) => sum + review.rating, 0) /
              product.reviews.length
            ).toFixed(1)
          : "Нет оценок",
    }))
  );
}
