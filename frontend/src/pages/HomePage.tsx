import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { previewCategories, visiblePreviewDishes } from '../content/menuPreview';

export function HomePage() {
  return (
    <PageLayout>
      <section className="hero surface">
        <div className="hero__content">
          <p className="eyebrow">Kitchen Manager</p>
          <h1 className="hero__title">Menu, ordini, recensioni e analisi AI in un unico flusso.</h1>
          <p className="hero__subtitle">
            Questa pagina introduce il flusso reale supportato dal backend: esplorazione
            del menu, conferma ordine, avanzamento stato, recensioni cliente e analisi AI
            lato admin.
          </p>
          <div className="hero__actions">
            <Link to="/menu" className="button button--primary">
              Apri il menu
            </Link>
            <Link to="/login" className="button button--secondary">
              Vai al login
            </Link>
          </div>
        </div>

        <div className="hero__panel surface surface--accent">
          <h2>Come provare l&apos;app</h2>
          <ol className="feature-list feature-list--ordered">
            <li>Apri il menu per vedere i piatti reali del seed backend.</li>
            <li>Registrati come cliente oppure accedi con un account esistente.</li>
            <li>Per l&apos;admin usa `admin` / `admin123`.</li>
            <li>Dal menu puoi aggiungere piatti e confermare l&apos;ordine.</li>
            <li>L&apos;admin puo avanzare lo stato da Gestione ordini.</li>
            <li>Quando un ordine e consegnato, il cliente puo lasciare una recensione.</li>
          </ol>
        </div>
      </section>

      <section className="feature-grid">
        <article className="surface feature-card">
          <h2>Menu attuale</h2>
          <p>
            Il frontend legge le categorie e i piatti dal backend. Se il backend non e
            disponibile, mostra solo un fallback coerente con il seed.
          </p>
          <ul className="feature-list">
            {previewCategories.map((category) => (
              <li key={category.id}>{category.name}</li>
            ))}
          </ul>
        </article>
        <article className="surface feature-card">
          <h2>Flusso cliente</h2>
          <p>
            I piatti attivi mostrati nel menu rispettano lo stato del backend e possono
            essere confermati come ordine solo dopo il login.
          </p>
          <ul className="feature-list">
            {visiblePreviewDishes.map((dish) => (
              <li key={dish.id}>{dish.name}</li>
            ))}
          </ul>
        </article>
        <article className="surface feature-card">
          <h2>Flusso admin e AI</h2>
          <p>
            L&apos;area admin permette di cambiare lo stato degli ordini. L&apos;analisi AI e
            disponibile solo se esistono almeno 3 recensioni e la chiave Gemini e
            configurata nel backend.
          </p>
        </article>
      </section>
    </PageLayout>
  );
}
