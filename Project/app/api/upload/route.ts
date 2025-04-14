import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as Blob | null;

  if (!file) {
    return NextResponse.json({ error: "Файл обязателен" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Подписываем запрос
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(`timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
    .digest("hex");

  // Используем встроенный FormData из Node.js
  const cloudinaryForm = new FormData();
  const fileBlob = new Blob([buffer], { type: "image/jpeg" }); // Создаём Blob из Buffer
  cloudinaryForm.append("file", fileBlob, "image.jpg");
  cloudinaryForm.append("api_key", process.env.CLOUDINARY_API_KEY!);
  cloudinaryForm.append("timestamp", timestamp.toString());
  cloudinaryForm.append("signature", signature);

  // Загружаем файл в Cloudinary
  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: cloudinaryForm,
    }
  );

  const uploadData = await uploadRes.json();
  if (!uploadRes.ok) {
    return NextResponse.json(
      { error: uploadData.error.message },
      { status: uploadRes.status }
    );
  }

  return NextResponse.json({ url: uploadData.secure_url });
}
