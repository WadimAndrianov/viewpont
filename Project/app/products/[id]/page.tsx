"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react"; // Импортируем useSession

export default function ProductPage() {
  const { id } = useParams(); // Получаем id продукта из URL
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // Управление формой
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null); // Сохранение ошибки
  const { data: session } = useSession(); // Получаем данные о сессии
  const [userReview, setUserReview] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  //const userReview = product?.reviews?.find(
  //  (review: any) => review.userId === Number(session?.user?.id)
  //.);
  useEffect(() => {
    if (product && session?.user?.id) {
      setUserReview(
        product.reviews.find(
          (review: any) => review.userId === Number(session.user.id)
        )
      );
    }
  }, [product, session]);

  const handleSubmitReview = async () => {
    if (!reviewContent.trim()) {
      setError("Введите текст отзыва!");
      return;
    }

    setSubmitting(true);
    setError(null); // Очистка прошлых ошибок

    try {
      const response = await fetch(`/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(id),
          content: reviewContent,
          rating: reviewRating,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Ошибка при отправке отзыва.");
        return;
      }

      setProduct((prev: any) => ({
        ...prev,
        reviews: [...prev.reviews, result],
      }));

      setShowForm(false);
      setReviewContent("");
      setReviewRating(5);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;

    try {
      const response = await fetch(`/api/reviews/${userReview.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setError("Ошибка при удалении отзыва.");
        return;
      }

      setProduct((prev: any) => ({
        ...prev,
        reviews: prev.reviews.filter((r: any) => r.id !== userReview.id),
      }));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <p className="text-center mt-4">Загрузка...</p>;
  if (!product)
    return <p className="text-danger text-center mt-4">Продукт не найден.</p>;

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-3 mb-5 bg-white rounded">
        <div className="row g-0">
          <div className="col-md-4 text-center">
            <Image
              src={product.imageUrl}
              width={300}
              height={450}
              alt={product.name}
              className="img-fluid rounded"
            />
          </div>
          <div className="col-md-8">
            <div className="card-body">
              <h2 className="card-title">{product.name}</h2>
              <p className="card-text">
                {product.description || "Нет описания."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {session ? (
        !userReview && (
          <button
            className="btn btn-success mt-3"
            onClick={() => setShowForm(true)}
          >
            Оставить отзыв
          </button>
        )
      ) : (
        <p className="text-muted">
          Войдите или зарегистрируйтесь, чтобы оставить отзыв
        </p>
      )}

      {/*{session && userReview && (
        <button
          className="btn btn-danger mt-3 ms-2"
          onClick={handleDeleteReview}
        >
          Удалить свой отзыв
        </button>
      )}*/}

      {/* Форма добавления отзыва */}
      {showForm && (
        <div className="mt-3 p-3 border rounded">
          <h4>Добавить отзыв</h4>
          {error && <p className="text-danger">{error}</p>} {/* Вывод ошибки */}
          <textarea
            className="form-control"
            placeholder="Введите ваш отзыв..."
            rows={3}
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
          />
          <select
            className="mt-2 form-select"
            value={reviewRating}
            onChange={(e) => setReviewRating(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num} ⭐
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary mt-3"
            onClick={handleSubmitReview}
            disabled={submitting}
          >
            {submitting ? "Отправка..." : "Отправить"}
          </button>
          <button
            className="btn btn-secondary mt-3 ms-2"
            onClick={() => setShowForm(false)}
          >
            Отмена
          </button>
        </div>
      )}

      {/* Блок отзывов */}
      <h3 className="mt-4">Отзывы:</h3>
      {product.reviews.length > 0 ? (
        <div className="mb-3">
          {/* Отзыв текущего пользователя (если есть) */}
          {userReview && (
            <div className="card mb-3 border-primary">
              <div className="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 text-primary">
                  {userReview.user?.username}{" "}
                </h5>
                {userReview.userId && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    data-bs-toggle="modal"
                    data-bs-target="#Modal1"
                  >
                    Удалить
                  </button>
                )}
              </div>
              <div className="card-body">
                <p className="card-text">{userReview.content}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">
                    Оценка: <strong>{userReview.rating} ⭐</strong>
                  </span>
                  <small className="text-muted">
                    {new Date(userReview.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* Остальные отзывы */}
          {product.reviews
            .filter((review: any) => review.id !== userReview?.id)
            .map((review: any) => (
              <div key={review.id} className="card mb-2">
                <div className="card-header">
                  <h6 className="mb-0">{review.user?.username}</h6>
                </div>
                <div className="card-body">
                  <p className="card-text">{review.content}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">
                      Оценка: <strong>{review.rating} ⭐</strong>
                    </span>
                    <small className="text-muted">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-muted">Отзывов пока нет.</p>
      )}

      {/*!-- Modal -->*/}
      <div
        className="modal fade"
        id="Modal1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Удаление отзыва
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Отмена
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteReview}
                data-bs-dismiss="modal"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
