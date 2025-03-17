"use client"; // Делаем компонент клиентским

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function MainHeader() {
  const pathname = usePathname(); // Получаем текущий путь
  const router = useRouter(); // Используем навигацию
  const { data: session } = useSession(); // Получаем сессию

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" href="/home">
          ViewPoint
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {/* Выпадающий список */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="categoriesDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Категории
              </a>
              <ul
                className="dropdown-menu bg-dark text-light"
                aria-labelledby="categoriesDropdown"
              >
                <li>
                  <button
                    className="dropdown-item text-light"
                    onClick={() => handleNavigation("/movies")}
                  >
                    Фильмы
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item text-light"
                    onClick={() => handleNavigation("/books")}
                  >
                    Книги
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item text-light"
                    onClick={() => handleNavigation("/games")}
                  >
                    Игры
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item text-light"
                    onClick={() => handleNavigation("/series")}
                  >
                    Сериалы
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item text-light"
                    onClick={() => handleNavigation("/music")}
                  >
                    Музыка
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item text-light"
                    onClick={() => handleNavigation("/anime")}
                  >
                    Аниме
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item text-light"
                    onClick={() => handleNavigation("/comics")}
                  >
                    Комиксы
                  </button>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <button
                className="nav-link ms-2"
                onClick={() => router.push("/login")}
                disabled={!!session} // Блокируем, если есть сессия
              >
                Войти
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link ms-2"
                onClick={() => router.push("/registration")}
                disabled={!!session} // Блокируем, если есть сессия
              >
                Регистрация
              </button>
            </li>

            <li className="nav-item">
              <Link className="nav-link ms-2" href="/profile">
                Профиль
              </Link>
            </li>
            <li className="nav-item">
              {session ? (
                <button
                  className="nav-link ms-2"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Выйти
                </button>
              ) : null}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export { MainHeader };
