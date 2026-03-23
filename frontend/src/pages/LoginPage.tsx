import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth';
import { PageLayout } from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/api';

type LoginFormState = {
  username: string;
  password: string;
};

const initialFormState: LoginFormState = {
  username: '',
  password: '',
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState<LoginFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const session = await loginUser({
        username: form.username.trim(),
        password: form.password,
      });

      login(session);

      const state = location.state as { from?: string } | null;
      const fallbackPath = session.role === 'admin' ? '/admin/orders' : '/menu';
      const destination = typeof state?.from === 'string' ? state.from : fallbackPath;

      navigate(destination, { replace: true });
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'Accesso non riuscito. Verifica username, password e che il backend sia avviato.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Accedi"
      subtitle="Questa schermata usa ora le API reali di autenticazione del backend."
    >
      <section className="auth-shell">
        <article className="surface auth-card">
          <div className="callout">
            Per il test admin puoi usare
            <strong> admin </strong>
            /
            <strong> admin123</strong>, come definito nel seed backend.
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>Username</span>
              <input
                className="input"
                name="username"
                value={form.username}
                onChange={(event) =>
                  setForm((current) => ({ ...current, username: event.target.value }))
                }
                placeholder="Inserisci lo username"
                required
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                className="input"
                type="password"
                name="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="Inserisci la password"
                required
              />
            </label>

            {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

            <button
              type="submit"
              className="button button--primary button--full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>

          <p className="form-note">
            Non hai ancora un account cliente? Vai a <Link to="/register">registrazione</Link>.
          </p>
        </article>
      </section>
    </PageLayout>
  );
}
