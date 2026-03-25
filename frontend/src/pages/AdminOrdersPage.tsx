import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { fetchOrders, updateOrderStatus } from '../api/orders';
import { fetchReviews } from '../api/reviews';
import { PageLayout } from '../components/layout/PageLayout';
import type { Order, OrderFilters, OrderStatus } from '../types/orders';
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

type OrderFilterForm = {
  status: '' | OrderStatus;
  customer: string;
  dateFrom: string;
  dateTo: string;
};

const emptyOrderFilterForm: OrderFilterForm = {
  status: '',
  customer: '',
  dateFrom: '',
  dateTo: '',
};

function buildOrderFilters(form: OrderFilterForm): OrderFilters {
  const filters: OrderFilters = {};

  if (form.status) {
    filters.status = form.status;
  }

  const customer = form.customer.trim();
  if (customer) {
    filters.customer = customer;
  }

  if (form.dateFrom) {
    filters.dateFrom = form.dateFrom;
  }

  if (form.dateTo) {
    filters.dateTo = form.dateTo;
  }

  return filters;
}

function hasActiveOrderFilters(filters: OrderFilters) {
  return Boolean(filters.status || filters.customer || filters.dateFrom || filters.dateTo);
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filterForm, setFilterForm] = useState<OrderFilterForm>(emptyOrderFilterForm);
  const [appliedFilters, setAppliedFilters] = useState<OrderFilters>({});
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadOrdersAndReviews() {
      try {
        const [ordersData, reviewsData] = await Promise.all([
          fetchOrders(appliedFilters),
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

    setIsLoadingOrders(true);
    void loadOrdersAndReviews();

    return () => {
      isMounted = false;
    };
  }, [appliedFilters]);

  const reviewsByOrderId = useMemo(
    () => new Map(reviews.map((review) => [review.orderId, review])),
    [reviews],
  );

  const hasAppliedFilters = hasActiveOrderFilters(appliedFilters);

  function handleFilterChange(
    field: keyof OrderFilterForm,
    value: OrderFilterForm[keyof OrderFilterForm],
  ) {
    setFilterForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function handleApplyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      filterForm.dateFrom &&
      filterForm.dateTo &&
      filterForm.dateFrom > filterForm.dateTo
    ) {
      setNotice({
        tone: 'info',
        text: 'La data finale deve essere successiva o uguale alla data iniziale.',
      });
      return;
    }

    setNotice(null);
    setAppliedFilters(buildOrderFilters(filterForm));
  }

  function handleResetFilters() {
    setFilterForm(emptyOrderFilterForm);
    setNotice(null);
    setAppliedFilters({});
  }

  async function handleAdvanceOrderStatus(order: Order) {
    const nextStatus = getNextOrderStatus(order.status);

    if (!nextStatus) {
      return;
    }

    setUpdatingOrderId(order.id);
    setNotice(null);

    try {
      const updatedOrder = await updateOrderStatus(order.id, nextStatus);
      const [ordersData, reviewsData] = await Promise.all([
        fetchOrders(appliedFilters),
        fetchReviews(),
      ]);

      setOrders(ordersData);
      setReviews(reviewsData);
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
      <section className="surface admin-order-filters">
        <form className="admin-order-filters__form" onSubmit={handleApplyFilters}>
          <div className="admin-order-filters__grid">
            <label className="field">
              <span>Stato</span>
              <select
                className="input"
                value={filterForm.status}
                onChange={(event) =>
                  handleFilterChange('status', event.target.value as '' | OrderStatus)
                }
              >
                <option value="">Tutti</option>
                <option value="received">Ricevuto</option>
                <option value="preparing">In preparazione</option>
                <option value="ready">Pronto</option>
                <option value="delivered">Consegnato</option>
              </select>
            </label>

            <label className="field">
              <span>Cliente</span>
              <input
                className="input"
                value={filterForm.customer}
                onChange={(event) => handleFilterChange('customer', event.target.value)}
                placeholder="Es. mario"
              />
            </label>

            <label className="field">
              <span>Data da</span>
              <input
                className="input"
                type="date"
                value={filterForm.dateFrom}
                onChange={(event) => handleFilterChange('dateFrom', event.target.value)}
              />
            </label>

            <label className="field">
              <span>Data a</span>
              <input
                className="input"
                type="date"
                value={filterForm.dateTo}
                onChange={(event) => handleFilterChange('dateTo', event.target.value)}
              />
            </label>
          </div>

          <div className="admin-order-filters__actions">
            <button type="submit" className="button button--primary" disabled={isLoadingOrders}>
              Applica filtri
            </button>
            <button
              type="button"
              className="button button--secondary"
              onClick={handleResetFilters}
              disabled={isLoadingOrders && !hasAppliedFilters}
            >
              Reset
            </button>
          </div>
        </form>

        <p className="muted-text admin-order-filters__summary">
          {hasAppliedFilters
            ? `${orders.length} ordini trovati con i filtri attivi.`
            : `${orders.length} ordini totali disponibili.`}
        </p>
      </section>

      {notice ? (
        <section className={`status-banner status-banner--${notice.tone}`}>
          {notice.text}
        </section>
      ) : null}

      {isLoadingOrders ? (
        <section className="surface empty-state">
          <h2>Caricamento ordini</h2>
          <p>
            {hasAppliedFilters
              ? 'Sto aggiornando gli ordini con i filtri selezionati.'
              : 'Sto recuperando gli ordini per l\'area cucina.'}
          </p>
        </section>
      ) : orders.length === 0 ? (
        <section className="surface empty-state">
          <h2>{hasAppliedFilters ? 'Nessun risultato' : 'Nessun ordine presente'}</h2>
          <p>
            {hasAppliedFilters
              ? 'Nessun ordine corrisponde ai filtri selezionati. Prova a modificarli o a resettarli.'
              : 'Quando verranno creati ordini lato cliente, appariranno qui.'}
          </p>
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
