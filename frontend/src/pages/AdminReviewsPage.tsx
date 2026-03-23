import { useEffect, useState } from 'react';
import { fetchOrders } from '../api/orders';
import { fetchReviewAiSummary, fetchReviews } from '../api/reviews';
import { PageLayout } from '../components/layout/PageLayout';
import type { Order } from '../types/orders';
import type { Review, ReviewAiSummary } from '../types/reviews';
import { getApiErrorMessage } from '../utils/api';
import { formatDateTime } from '../utils/format';

type Notice = {
  tone: 'success' | 'error' | 'info';
  text: string;
};

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiSummary, setAiSummary] = useState<ReviewAiSummary | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [reviewsData, ordersData] = await Promise.all([
          fetchReviews(),
          fetchOrders(),
        ]);

        if (!isMounted) {
          return;
        }

        setReviews(reviewsData);
        setOrders(ordersData);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setNotice({
          tone: 'error',
          text: getApiErrorMessage(
            error,
            'Non sono riuscito a recuperare recensioni e ordini per l\'area admin.',
          ),
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleGenerateAiSummary() {
    setIsLoadingAi(true);
    setNotice(null);

    try {
      const summary = await fetchReviewAiSummary();
      setAiSummary(summary);

      if (summary.detail) {
        setNotice({
          tone: 'info',
          text: summary.detail,
        });
      } else if (summary.results?.error) {
        setNotice({
          tone: 'error',
          text: summary.results.error,
        });
      }
    } catch (error) {
      setNotice({
        tone: 'error',
        text: getApiErrorMessage(
          error,
          'Non sono riuscito a recuperare l\'analisi AI delle recensioni.',
        ),
      });
    } finally {
      setIsLoadingAi(false);
    }
  }

  function getOrderById(orderId: number) {
    return orders.find((order) => order.id === orderId);
  }

  return (
    <PageLayout
      title="Recensioni"
      subtitle="Questa pagina raccoglie tutte le recensioni lato admin e permette di avviare il summary AI sui feedback dei clienti."
    >
      {notice ? (
        <section className={`status-banner status-banner--${notice.tone}`}>
          {notice.text}
        </section>
      ) : null}

      <section className="surface ai-card">
        <div className="ai-card__header">
          <div>
            <p className="eyebrow">Analisi AI recensioni</p>
            <h2>Insight per il ristorante</h2>
            <p className="muted-text">
              Per ottenere un risultato reale servono almeno 3 recensioni e una
              configurazione valida di `GEMINI_API_KEY`.
            </p>
          </div>
          <button
            type="button"
            className="button button--primary"
            onClick={handleGenerateAiSummary}
            disabled={isLoadingAi}
          >
            {isLoadingAi ? 'Analisi in corso...' : 'Genera analisi AI'}
          </button>
        </div>

        {aiSummary?.results && !aiSummary.results.error ? (
          <div className="ai-grid">
            <article className="surface metric-card">
              <p className="eyebrow">Sentiment</p>
              <h3>
                {aiSummary.results.sentimentScore
                  ? `${aiSummary.results.sentimentScore}/5`
                  : 'N/D'}
              </h3>
            </article>
            <article className="surface metric-card">
              <p className="eyebrow">Piatto top</p>
              <h3>{aiSummary.results.topDish || 'N/D'}</h3>
            </article>
            <article className="surface metric-card">
              <p className="eyebrow">Provider</p>
              <h3>{aiSummary.provider || 'N/D'}</h3>
            </article>
            <article className="surface metric-card metric-card--full">
              <p className="eyebrow">Criticita principale</p>
              <h3>{aiSummary.results.mainComplaint || 'Nessuna criticita rilevata'}</h3>
              <p className="muted-text">{aiSummary.results.advice || 'Nessun consiglio disponibile.'}</p>
            </article>
          </div>
        ) : aiSummary?.detail ? (
          <p className="muted-text">{aiSummary.detail}</p>
        ) : null}
      </section>

      {isLoading ? (
        <section className="surface empty-state">
          <h2>Caricamento recensioni</h2>
          <p>Sto recuperando le recensioni dal backend.</p>
        </section>
      ) : reviews.length === 0 ? (
        <section className="surface empty-state">
          <h2>Nessuna recensione presente</h2>
          <p>Le recensioni appariranno qui quando i clienti le invieranno su ordini consegnati.</p>
        </section>
      ) : (
        <section className="stack">
          {reviews.map((review) => {
            const order = getOrderById(review.orderId);

            return (
              <article key={review.id} className="surface review-admin-card">
                <div className="review-admin-card__header">
                  <div>
                    <p className="eyebrow">Recensione #{review.id}</p>
                    <h2>Ordine #{review.orderId}</h2>
                    <p className="muted-text">
                      {order?.username ? `Cliente: ${order.username}` : 'Cliente non disponibile'}
                    </p>
                  </div>
                  <div className="review-admin-card__meta">
                    <span className="rating-pill">Valutazione {review.rating}/5</span>
                    <span className="muted-text">{formatDateTime(review.createdAt)}</span>
                  </div>
                </div>

                <p className="review-admin-card__comment">
                  {review.comment || 'Nessun commento testuale inserito.'}
                </p>
              </article>
            );
          })}
        </section>
      )}
    </PageLayout>
  );
}
