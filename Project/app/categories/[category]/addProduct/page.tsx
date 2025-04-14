"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage({
  params,
}: {
  params: { category: string };
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return alert("Выберите изображение");

    setLoading(true);

    // 1. Загружаем изображение через бэкенд
    const formData = new FormData();
    formData.append("file", image);
    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const uploadData = await uploadRes.json();

    if (!uploadRes.ok) {
      setLoading(false);
      return alert(`Ошибка загрузки: ${uploadData.error}`);
    }

    // 2. Отправляем данные в API
    const res = await fetch(`/api/categories/${params.category}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        imageUrl: uploadData.url, // Передаём URL загруженного изображения
        category: params.category,
      }),
    });

    if (res.ok) {
      router.push(`/categories/${params.category}`);
    } else {
      alert("Ошибка добавления продукта!");
    }

    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Добавить продукт в категорию: {params.category}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Название</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Описание (необязательно)</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Постер</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Загрузка..." : "Добавить"}
        </button>
      </form>
    </div>
  );
}
