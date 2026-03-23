import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchOrders } from '../api/orders';
import { createReview, fetchReviews } from '../api/reviews';
import { PageLayout } from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';
import type { Order } from '../types/orders';
import type { Review } from '../types/reviews';
import { getApiErrorMessage } from '../utils/api';
import { formatCurrency, formatDateTime } from '../utils/format';
import { getOrderStatusLabel } from '../utils/orderStatus';

type Notice = {
  tone: 'success' | 'error' | 'info';
  text: string;
};

type ReviewDraft = {
  rating: string;
  comment: string;
};

const defaultReviewDraft: ReviewDraft = {
  rating: '5',
  comment: '',
};

export function OrdersPage() {
  const location = useLocation();
  const { user, role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [reviewDrafts, setReviewDrafts] = useState<Record<number, ReviewDraft>>({});
  const [submittingReviewOrderId, setSubmittingReviewOrderId] = useState<number | null>(null);

  useEffect(() => {
    const state = location.state as { message?: string } | null;

    if (state?.message) {
      setNotice({
        tone: 'success',
        text: state.message,
      });
    }
  }, [location.state]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [ordersData, reviewsData] = await Promise.all([
          fetchOrders(),
          fetchReviews(),
        ]);

        if (!isMounted) {
          return;
        }

        setOrders(ordersData);
        setReviews(reviewsData);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setNotice({
          tone: 'error',
          text: getApiErrorMessage(
            error,
            'Non sono riuscito a recuperare ordini e recensioni dal backend.',
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

  const reviewsByOrderId = new Map(reviews.map((review) => [review.orderId, review]));

  async function handleReviewSubmit(orderId: number, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft = reviewDrafts[orderId] ?? defaultReviewDraft;

    setSubmittingReviewOrderId(orderId);
    setNotice(null);

    try {
      const createdReview = await createReview({
        orderId,
        rating: Number(draft.rating),
        comment: draft.comment.trim(),
      });

      setReviews((currentReviews) => [createdReview, ...currentReviews]);
      setReviewDrafts((currentDrafts) => ({
        ...currentDrafts,
        [orderId]: defaultReviewDraft,
      }));
      setNotice({
        tone: 'success',
        text: `Recensione salvata per l'ordine #${orderId}.`,
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        text: getApiErrorMessage(
          error,
          'Non sono riuscito a salvare la recensione.',
        ),
      });
    } finally {
      setSubmittingReviewOrderId(null);
    }
  }

  return (
    <PageLayout
      title={role === 'admin' ? 'Ordini' : 'I miei ordini'}
      subtitle={
        role === 'admin'
          ? 'Come admin il backend restituisce tutti gli ordini. Per cambiare stato usa comunque la sezione Gestione ordini.'
          : 'Qui trovi lo storico dei tuoi ordini e puoi lasciare una recensione dopo la consegna.'
      }
    >
      {notice ? (
        <section className={`status-banner status-banner--${notice.tone}`}>
          {notice.text}
        </section>
      ) : null}

      {isLoading ? (
        <section className="surface empty-state">
          <h2>Caricamento ordini</h2>
          <p>Sto recuperando lo storico dal backend.</p>
        </section>
      ) : orders.length === 0 ? (
        <section className="surface empty-state">
          <h2>Nessun ordine trovato</h2>
          <p>
            Quando confermerai un ordine dal menu, lo vedrai comparire qui con il suo stato.
          </p>
          <Link to="/menu" className="button button--primary">
            Torna al menu
          </Link>
        </section>
      ) : (
        <section className="stack">
          {orders.map((order) => {
            const review = reviewsByOrderId.get(order.id);
            const reviewDraft = reviewDrafts[order.id] ?? defaultReviewDraft;

            return (
              <article key={order.id} className="surface order-card">
                <div className="order-card__header">
                  <div>
                    <p className="eyebrow">Ordine #{order.id}</p>
                    <h2>{formatDateTime(order.createdAt)}</h2>
                    {order.username ? (
                      <p className="muted-text">Cliente: {order.username}</p>
                    ) : null}
                  </div>
                  <span className={`status-badge status-badge--${order.status}`}>
                    {getOrderStatusLabel(order.status)}
                  </span>
                </div>

                <div className="order-items">
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item-row">
                      <div>
                        <strong>{item.dishName}</strong>
                        <p>{item.category}</p>
                      </div>
                      <div className="order-item-row__meta">
                        <span>{item.quantity}x</span>
                        <span>{formatCurrency(item.lineTotal)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {order.notes ? <p className="note-box">Note: {order.notes}</p> : null}

                <div className="order-card__footer">
                  <strong>Totale {formatCurrency(order.totalAmount)}</strong>
                </div>

                <section className="review-section">
                  <h3>Recensione</h3>

                  {review ? (
                    <div className="review-summary">
                      <p className="review-summary__rating">
                        Valutazione: {review.rating}/5
                      </p>
                      <p>{review.comment || 'Nessun commento lasciato.'}</p>
                      <p className="muted-text">
                        Inserita il {formatDateTime(review.createdAt)}
                      </p>
                    </div>
                  ) : role === 'admin' ? (
                    <p className="muted-text">
                      Le recensioni possono essere inserite solo dai clienti sugli ordini
                      consegnati.
                    </p>
                  ) : order.status !== 'delivered' ? (
                    <p className="muted-text">
                      La recensione sara disponibile quando l&apos;ordine risultera consegnato.
                    </p>
                  ) : (
                    <form
                      className="review-form"
                      onSubmit={(event) => handleReviewSubmit(order.id, event)}
                    >
                      <label className="field">
                        <span>Valutazione</span>
                        <select
                          className="input"
                          value={reviewDraft.rating}
                          onChange={(event) =>
                            setReviewDrafts((currentDrafts) => ({
                              ...currentDrafts,
                              [order.id]: {
                                ...reviewDraft,
                                rating: event.target.value,
                              },
                            }))
                          }
                        >
                          <option value="5">5 - Eccellente</option>
                          <option value="4">4 - Molto buono</option>
                          <option value="3">3 - Buono</option>
                          <option value="2">2 - Da migliorare</option>
                          <option value="1">1 - Scarso</option>
                        </select>
                      </label>

                      <label className="field">
                        <span>Commento</span>
                        <textarea
                          className="textarea"
                          value={reviewDraft.comment}
                          onChange={(event) =>
                            setReviewDrafts((currentDrafts) => ({
                              ...currentDrafts,
                              [order.id]: {
                                ...reviewDraft,
                                comment: event.target.value,
                              },
                            }))
                          }
                          placeholder="Racconta com'e andata. Un commento aiuta anche l'analisi AI lato admin."
                        />
                      </label>

                      <button
                        type="submit"
                        className="button button--primary"
                        disabled={submittingReviewOrderId === order.id}
                      >
                        {submittingReviewOrderId === order.id
                          ? 'Invio recensione...'
                          : 'Invia recensione'}
                      </button>
                    </form>
                  )}
                </section>
              </article>
            );
          })}
        </section>
      )}
    </PageLayout>
  );
}
