// profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";

// Это серверный компонент
export default async function ProfilePage() {
  const session = await getServerSession(authOptions); // Получаем сессию с сервера
  console.log(session);
  return (
    <div className="container">
      <div className="row justify-center">
        <div className="col-md-6">
          {session ? (
            <div>
              <div className="text-primary">Вы авторизованы</div>
              <div>
                <strong>Имя:</strong> {session.user?.name}
              </div>
              <div>
                <strong>Почта:</strong> {session.user?.email}
              </div>
            </div>
          ) : (
            <div className="text-danger">Вы не авторизованы</div>
          )}
        </div>
      </div>
    </div>
  );
}
