import { useEffect, useMemo, useState } from 'react';
import { fetchOrders, updateOrderStatus } from '../api/orders';
import { fetchReviews } from '../api/reviews';
import { PageLayout } from '../components/layout/PageLayout';
import type { Order } from '../types/orders';
import type { Review } from '../types/reviews';
import { getApiErrorMessage } from '../utils/api';
import { formatCurrency, formatDateTime } from '../utils/format';
import {
  getNextOrderStatus,
  getOrderStatusActionLabel,
  getOrderStatusLabel,
} from '../utils/orderStatus';

type Notice = {
  tone: 'success' | 'error' | 'info';
  text: string;
};

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadOrdersAndReviews() {
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
            'Non sono riuscito a recuperare ordini e recensioni per l\'area admin.',
          ),
        });
      } finally {
        if (isMounted) {
          setIsLoadingOrders(false);
        }
      }
    }

    void loadOrdersAndReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  const reviewsByOrderId = useMemo(
    () => new Map(reviews.map((review) => [review.orderId, review])),
    [reviews],
  );

  async function handleAdvanceOrderStatus(order: Order) {
    const nextStatus = getNextOrderStatus(order.status);

    if (!nextStatus) {
      return;
    }

    setUpdatingOrderId(order.id);
    setNotice(null);

    try {
      const updatedOrder = await updateOrderStatus(order.id, nextStatus);

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === updatedOrder.id ? updatedOrder : currentOrder,
        ),
      );
      setNotice({
        tone: 'success',
        text: `Ordine #${order.id} aggiornato a "${getOrderStatusLabel(updatedOrder.status)}".`,
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        text: getApiErrorMessage(
          error,
          `Non sono riuscito ad aggiornare lo stato dell'ordine #${order.id}.`,
        ),
      });
    } finally {
      setUpdatingOrderId(null);
    }
  }

  return (
    <PageLayout
      title="Gestione ordini"
      subtitle="Qui l'admin vede tutti gli ordini e può aggiornarne lo stato. Se un ordine consegnato ha una recensione, viene mostrata direttamente nella card."
    >
      {notice ? (
        <section className={`status-banner status-banner--${notice.tone}`}>
          {notice.text}
        </section>
      ) : null}

      {isLoadingOrders ? (
        <section className="surface empty-state">
          <h2>Caricamento ordini</h2>
          <p>Sto recuperando gli ordini per l&apos;area cucina.</p>
        </section>
      ) : orders.length === 0 ? (
        <section className="surface empty-state">
          <h2>Nessun ordine presente</h2>
          <p>Quando verranno creati ordini lato cliente, appariranno qui.</p>
        </section>
      ) : (
        <section className="stack">
          {orders.map((order) => {
            const review = reviewsByOrderId.get(order.id);

            return (
              <article key={order.id} className="surface admin-order-card">
                <div className="admin-order-card__header">
                  <div>
                    <p className="eyebrow">Ordine #{order.id}</p>
                    <h2>{order.username || 'Cliente non disponibile'}</h2>
                    <p className="muted-text">{formatDateTime(order.createdAt)}</p>
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

                {review ? (
                  <section className="review-section review-section--admin">
                    <h3>Recensione del cliente</h3>
                    <div className="review-summary">
                      <p className="review-summary__rating">
                        Valutazione: {review.rating}/5
                      </p>
                      <p>{review.comment || 'Nessun commento lasciato.'}</p>
                      <p className="muted-text">
                        Inserita il {formatDateTime(review.createdAt)}
                      </p>
                    </div>
                  </section>
                ) : order.status === 'delivered' ? (
                  <section className="review-section review-section--admin">
                    <h3>Recensione del cliente</h3>
                    <p className="muted-text">
                      Nessuna recensione inserita per questo ordine.
                    </p>
                  </section>
                ) : null}

                <div className="admin-order-card__footer">
                  <strong>{formatCurrency(order.totalAmount)}</strong>
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => handleAdvanceOrderStatus(order)}
                    disabled={
                      updatingOrderId === order.id || getNextOrderStatus(order.status) === null
                    }
                  >
                    {updatingOrderId === order.id
                      ? 'Aggiornamento...'
                      : getOrderStatusActionLabel(order.status)}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </PageLayout>
  );
}
