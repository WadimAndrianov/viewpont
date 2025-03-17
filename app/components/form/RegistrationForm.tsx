"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

// Схема валидации с Zod
const registrationSchema = z
  .object({
    name: z.string().min(5, "Имя должно содержать минимум 5 символов"),
    email: z.string().email("Некорректный email"),
    password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function RegistrationForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setErrorMessage(null); // Очистка ошибки перед отправкой

    const response = await fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });

    const result = await response.json(); // Получаем ответ

    if (response.ok) {
      //reset();
      router.push("/login");
    } else {
      setErrorMessage(result.message || "Ошибка регистрации");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <div className="border p-4 rounded bg-light">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Ошибка регистрации */}
              {errorMessage && <p className="text-danger">{errorMessage}</p>}

              {/* Кнопки "Регистрация" и "Вход" */}
              <div className="row mb-4">
                <div className="col">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg w-100"
                  >
                    Регистрация
                  </button>
                </div>
                <div className="col">
                  <Link
                    href="/login"
                    className="btn btn-secondary btn-lg w-100"
                  >
                    Вход
                  </Link>
                </div>
              </div>

              {/* Поле "Имя" */}
              <div className="mb-3">
                <label htmlFor="RegName" className="form-label">
                  Имя
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="RegName"
                  placeholder="Введите ваше имя"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-danger">{errors.name.message}</p>
                )}
              </div>

              {/* Поле "Электронная почта" */}
              <div className="mb-3">
                <label htmlFor="RegEmail" className="form-label">
                  Электронная почта
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="RegEmail"
                  placeholder="name@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-danger">{errors.email.message}</p>
                )}
              </div>

              {/* Поле "Пароль" */}
              <div className="mb-3">
                <label htmlFor="RegPassword1" className="form-label">
                  Пароль
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="RegPassword1"
                  placeholder="Введите пароль"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-danger">{errors.password.message}</p>
                )}
              </div>

              {/* Поле "Повторите пароль" */}
              <div className="mb-3">
                <label htmlFor="RegPassword2" className="form-label">
                  Повторите пароль
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="RegPassword2"
                  placeholder="Повторите пароль"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-danger">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Кнопка "Зарегистрироваться" */}
              <div className="d-grid">
                <button type="submit" className="btn btn-primary btn-lg">
                  Зарегистрироваться
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
