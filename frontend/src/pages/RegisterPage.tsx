import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api/auth';
import { PageLayout } from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/api';

type RegisterFormState = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialFormState: RegisterFormState = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState<RegisterFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await registerUser({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        passwordConfirm: form.confirmPassword,
      });

      const session = await loginUser({
        username: form.username.trim(),
        password: form.password,
      });

      login(session);
      navigate('/menu', { replace: true });
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'Registrazione non riuscita. Controlla i campi inseriti e verifica che il backend sia attivo.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Registrazione"
      subtitle="Questa pagina crea davvero un nuovo utente customer tramite il backend."
    >
      <section className="auth-shell">
        <article className="surface auth-card">
          <div className="callout">
            Dopo la registrazione effettuo automaticamente il login e ti porto nel menu.
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>Username</span>
              <input
                className="input"
                value={form.username}
                onChange={(event) =>
                  setForm((current) => ({ ...current, username: event.target.value }))
                }
                placeholder="Scegli uno username"
                required
              />
            </label>

            <label className="field">
              <span>Email</span>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="nome@example.com"
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="Crea una password"
                required
              />
            </label>

            <label className="field">
              <span>Conferma password</span>
              <input
                className="input"
                type="password"
                value={form.confirmPassword}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                placeholder="Ripeti la password"
                required
              />
            </label>

            {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

            <button
              type="submit"
              className="button button--primary button--full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registrazione in corso...' : 'Registrati'}
            </button>
          </form>

          <p className="form-note">
            Hai gia un accesso? Torna a <Link to="/login">login</Link>.
          </p>
        </article>
      </section>
    </PageLayout>
  );
}
