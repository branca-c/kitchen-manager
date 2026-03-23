import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';

export function NotFoundPage() {
  return (
    <PageLayout>
      <section className="surface empty-state">
        <p className="eyebrow">404</p>
        <h1>Pagina non trovata</h1>
        <p>La rotta richiesta non esiste nel frontend attuale.</p>
        <Link to="/" className="button button--primary">
          Torna alla home
        </Link>
      </section>
    </PageLayout>
  );
}
