// profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";

// Это серверный компонент
export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm --bs-info-border-subtle">
            {session ? (
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <span className="fs-3 text-primary fw-bold">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h5 className="card-title mb-1">Ваш профиль</h5>
                  <p className="text-success small mb-0">Вы авторизованы</p>
                </div>

                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex align-items-center py-3">
                    <i className="bi bi-person me-3 text-muted"></i>
                    <div>
                      <div className="text-muted small">Имя</div>
                      <div className="fw-medium">{session.user?.name}</div>
                    </div>
                  </li>
                  <li className="list-group-item d-flex align-items-center py-3">
                    <i className="bi bi-envelope me-3 text-muted"></i>
                    <div>
                      <div className="text-muted small">Email</div>
                      <div className="fw-medium">{session.user?.email}</div>
                    </div>
                  </li>
                  <li className="list-group-item d-flex align-items-center py-3">
                    <i className="bi bi-shield-lock me-3 text-muted"></i>
                    <div>
                      <div className="text-muted small">Роль</div>
                      <div className="fw-medium text-capitalize">
                        {session.user?.role}
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="card-body text-center p-5">
                <div className="mb-4">
                  <i
                    className="bi bi-person-x text-danger"
                    style={{ fontSize: "3rem" }}
                  ></i>
                </div>
                <h5 className="card-title mb-2">Вы не авторизованы</h5>
                <p className="text-muted mb-4">
                  Войдите, чтобы оставлять отзывы!
                </p>
                <a href="/login" className="btn btn-primary px-4">
                  Войти
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
