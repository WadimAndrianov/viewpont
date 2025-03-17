// pages/index.tsx
import Head from "next/head";
import Link from "next/link";

export default function Index() {
  return (
    <>
      <Head>
        <title>Добро пожаловать | ViewPoint</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <h1 className="display-4 fw-bold">
            Добро пожаловать в <span className="text-primary">ViewPoint</span>
          </h1>
          <p className="lead">
            Оставляйте рецензии на фильмы, сериалы, книги и игры!
          </p>
          <div className="mt-4">
            <Link href="/login" className="btn btn-outline-primary btn-lg me-2">
              Войти
            </Link>
            <Link
              href="/registration"
              className="btn btn-outline-primary btn-lg"
            >
              Регистрация
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
