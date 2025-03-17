"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
//import { db } from './lib/db';  // Импортируем ваш Prisma Client

// Схема валидации
const loginSchema = z.object({
  name: z.string().min(5, "Имя должно содержать минимум 5 символов"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

const updateUserSchema = z.object({
  name: z.string().min(5, "Имя должно содержать минимум 5 символов"),
  email: z.string().email("Некорректный email"),
});

type UpdateUserData = z.infer<typeof updateUserSchema>;

type LoginFormData = z.infer<typeof loginSchema>;

const errorMessages: Record<string, string> = {
  EMPTY_FIELDS: "Введите имя и пароль.",
  USER_NOT_FOUND: "Пользователь не найден.",
  WRONG_PASSWORD: "Неверный пароль.",
  CredentialsSignin: "Ошибка входа.",
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false); // состояние для модального окна
  const [email, setEmail] = useState(""); // Состояние для email
  const [newName, setNewName] = useState(""); // Состояние для нового имени

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    formState: { errors: errorUpdate },
  } = useForm<UpdateUserData>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    const errorCode = searchParams.get("error");
    if (errorCode) {
      setErrorMessage(errorMessages[errorCode] || "Неизвестная ошибка");
    } else {
      setErrorMessage(""); // Очистка ошибки, если она исчезла из URL
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage("");
    console.log("Отправка данных для входа:", data); // Отладочная информация

    const loginData = await signIn("credentials", {
      name: data.name,
      password: data.password,
      redirect: false, // Остановим редирект, чтобы контролировать его вручную
    });

    console.log("Результат входа:", loginData); // Отладочная информация

    if (loginData?.ok == false && loginData.error) {
      console.log("Ошибка при авторизации:", loginData.error); // Отладочная информация
      setErrorMessage(errorMessages[loginData.error] || "Неизвестная ошибка");

      // Добавим параметр ошибки в URL, если она существует
      router.push(`/login?error=${encodeURIComponent(loginData.error)}`);
    } else if (loginData?.ok) {
      console.log("Успешный вход"); // Отладочная информация
      setErrorMessage(""); // Очистка ошибки

      // Прямое удаление параметра "error" из URL после успешного входа
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete("error");
      router.replace(currentUrl.toString()); // Перезаписать URL без параметра error

      // Редиректим на главную страницу
      router.replace("/home");
    }
  };

  const handleForgotPassword = async () => {
    // Проверяем, что email и newName заполнены
    if (!email || !newName) {
      alert("Заполните все поля.");
      return;
    }

    // Валидация email через zod
    const emailValidation = updateUserSchema.safeParse({
      email,
      name: newName,
    });

    if (!emailValidation.success) {
      // Если есть ошибки валидации, показываем их
      const errorMessages = emailValidation.error.errors.map(
        (err) => err.message
      );
      alert(errorMessages.join("\n"));
      return;
    }

    const newPassword = Math.random().toString(36).slice(-8);
    console.log(
      `Новый пароль для пользователя с почтой ${email} и новым именем ${newName}: ${newPassword}`
    );

    const response = await fetch("/api/user", {
      method: "PUT",
      body: JSON.stringify({
        email: email,
        newName: newName,
        newPassword: newPassword,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.status === 200) {
      alert(data.message);
      handleCloseModal();
    } else {
      alert(data.message || "Произошла ошибка.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <div className="border p-4 rounded bg-light">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Кнопки "Регистрация" и "Вход" */}
              <div className="row mb-4">
                <div className="col">
                  <Link
                    href="/registration"
                    className="btn btn-secondary btn-lg w-100"
                  >
                    Регистрация
                  </Link>
                </div>
                <div className="col">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg w-100"
                  >
                    Вход
                  </button>
                </div>
              </div>

              {/* Поле "Имя" */}
              <div className="mb-3">
                <label htmlFor="LoginName" className="form-label">
                  Имя
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  id="LoginName"
                  placeholder="Введите ваше имя"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-danger">{errors.name.message}</p>
                )}
              </div>

              {/* Поле "Пароль" */}
              <div className="mb-3">
                <label htmlFor="LoginPassword" className="form-label">
                  Пароль
                </label>
                <input
                  type="password"
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  id="LoginPassword"
                  placeholder="Введите пароль"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-danger">{errors.password.message}</p>
                )}
              </div>

              {/* Ошибка входа */}
              {errorMessage && (
                <div className="text-danger mb-3">{errorMessage}</div>
              )}

              {/* Кнопка "Войти" */}
              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Обработка..." : "Войти"}
                </button>
              </div>

              {/* Кнопка "Забыли пароль" */}
              <div className="d-grid d-md-flex justify-content-md-end">
                <button
                  className="btn btn-link"
                  type="button"
                  onClick={handleOpenModal} // Исправлено
                >
                  Забыли пароль или имя?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Модальное окно */}
      {/* Модальное окно */}
      {isModalOpen && (
        <div
          className="modal fade show"
          id="forgotPasswordModal"
          tabIndex={-1}
          aria-labelledby="forgotPasswordModalLabel"
          aria-hidden={!isModalOpen ? "true" : "false"}
          style={{ display: "block" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="forgotPasswordModalLabel">
                  Восстановление пароля
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleCloseModal}
                />
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Введите свою почту
                    </label>
                    <input
                      type="email"
                      className={`form-control ${
                        errorUpdate.email ? "is-invalid" : ""
                      }`}
                      id="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        registerUpdate("email");
                      }}
                      placeholder="example@mail.com"
                    />
                    {errorUpdate.email && (
                      <p className="text-danger">{errorUpdate.email.message}</p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="new-name" className="form-label">
                      Новое имя
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errorUpdate.name ? "is-invalid" : ""
                      }`}
                      id="new-name"
                      value={newName} // Привязка к состоянию
                      onChange={(e) => {
                        setNewName(e.target.value);
                        registerUpdate("name");
                      }} // Обновление состояния при изменении
                      placeholder="Новое имя"
                    />
                    {errorUpdate.name && (
                      <p className="text-danger">{errorUpdate.name.message}</p>
                    )}
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Закрыть
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    handleForgotPassword();
                  }}
                >
                  Отправить новый пароль
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
