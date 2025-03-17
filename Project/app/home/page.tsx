import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Главный контент */}
      <header className="vh-100 d-flex align-items-center justify-content-center text-center bg-primary text-white">
        <div>
          <h1 className="display-4">Добро пожаловать в ViewPoint</h1>
          <p className="lead">
            Ваше место для рецензий на фильмы, книги, сериалы и игры
          </p>
          <Link href="/registration" className="btn btn-light btn-lg">
            Присоединиться
          </Link>
        </div>
      </header>
    </>
  );
}
