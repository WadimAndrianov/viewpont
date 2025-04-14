"use client";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const [session, setSession] = useState<any>(null);
  const [products, setProducts] = useState<
    {
      id: string;
      name: string;
      imageUrl: string;
      averageRating: string;
      reviewCount: number;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // Новый стейт для поиска
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Количество товаров на одной странице

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  useEffect(() => {
    // Получаем сессию на клиенте
    getSession().then((session) => {
      setSession(session);
    });

    // Запрашиваем продукты
    fetch(`/api/categories/${params.category}/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.category]);

  const isAdmin = session?.user?.role === "admin"; // Проверка роли

  // Функция удаления продукта
  const handleDelete = async (productId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот продукт?")) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Не удалось удалить продукт!");
        throw new Error("Ошибка при удалении продукта");
      }

      // Убираем удалённый продукт из списка
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productId)
      );
    } catch (error) {
      alert("Не удалось удалить продукт!");
      console.error(error);
    }
  };

  // Функция сортировки
  const sortedProducts = [...products].sort((a, b) => {
    const ratingA = isNaN(parseFloat(a.averageRating))
      ? 0
      : parseFloat(a.averageRating);
    const ratingB = isNaN(parseFloat(b.averageRating))
      ? 0
      : parseFloat(b.averageRating);

    if (sortBy === "rating") {
      return ratingB - ratingA; // По убыванию рейтинга
    }

    if (sortBy === "reviews") {
      return (b.reviewCount || 0) - (a.reviewCount || 0); // По убыванию отзывов
    }

    return 0; // Без сортировки
  });

  const filteredProducts = sortedProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Категория: {params.category}</h2>
        {isAdmin && (
          <Link
            href={`/categories/${params.category}/addProduct`}
            className="btn btn-dark"
          >
            Добавить продукт
          </Link>
        )}
      </div>
      {/* Поле поиска */}
      <input
        type="text"
        className="form-control mb-3"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
      />
      {/* Кнопки сортировки */}
      <div className="d-flex gap-2 mb-3">
        <button
          className={`btn ${
            sortBy === "rating" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setSortBy(sortBy === "rating" ? null : "rating")}
        >
          Сортировать по рейтингу
        </button>
        <button
          className={`btn ${
            sortBy === "reviews" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setSortBy(sortBy === "reviews" ? null : "reviews")}
        >
          Сортировать по отзывам
        </button>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : paginatedProducts.length > 0 ? (
        <div className="row">
          {paginatedProducts.map((product) => (
            <div key={product.id} className="col-md-3 mb-4">
              <div className="card h-100 shadow-sm">
                <Image
                  src={product.imageUrl}
                  width={250}
                  height={400}
                  className="card-img-top"
                  alt={product.name}
                  style={{
                    objectFit: "contain",
                    height: "300px",
                    width: "100%",
                    marginTop: "10px",
                  }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text text-muted">
                    Рейтинг: {product.averageRating} ⭐
                  </p>
                  <p className="card-text text-muted">
                    Отзывов: {product.reviewCount}{" "}
                    {/* Отображаем количество отзывов */}
                  </p>
                  {/* Блок кнопок */}
                  <div className="mt-auto">
                    <Link
                      href={`/products/${product.id}`}
                      className="btn btn-dark w-100 mb-2"
                    >
                      Подробнее
                    </Link>

                    {/* Кнопки администратора */}
                    {isAdmin && (
                      <button
                        className="btn btn-outline-danger w-100 mb-2"
                        onClick={() => handleDelete(product.id)}
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="d-flex justify-content-center mt-4">
            <button
              className="btn btn-outline-primary mx-2 mb-4"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Предыдущая
            </button>

            <span className="mx-20 mb-4">Страница {currentPage}</span>

            <button
              className="btn btn-outline-primary mx-2 mb-4"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={endIndex >= filteredProducts.length}
            >
              Следующая →
            </button>
          </div>
        </div>
      ) : (
        <p>В этой категории пока нет продуктов.</p>
      )}
    </div>
  );
}
