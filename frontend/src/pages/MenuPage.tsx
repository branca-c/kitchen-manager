import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories, fetchDishes } from '../api/menu';
import { createOrder } from '../api/orders';
import { PageLayout } from '../components/layout/PageLayout';
import { visiblePreviewDishes, previewCategories } from '../content/menuPreview';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { Category, Dish } from '../types/menu';
import { getApiErrorMessage } from '../utils/api';
import { formatCurrency } from '../utils/format';

type Notice = {
  tone: 'success' | 'error' | 'info';
  text: string;
};

export function MenuPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, addItem, totalAmount, updateQuantity, removeItem, clear } = useCart();
  const [categories, setCategories] = useState<Category[]>(previewCategories);
  const [dishes, setDishes] = useState<Dish[]>(visiblePreviewDishes);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tutti');
  const [sourceLabel, setSourceLabel] = useState<'api' | 'preview'>('preview');
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMenu() {
      try {
        const [categoriesData, dishesData] = await Promise.all([
          fetchCategories(),
          fetchDishes(),
        ]);

        if (!isMounted) {
          return;
        }

        setCategories(categoriesData);
        setDishes(dishesData.filter((dish) => dish.isActive));
        setSourceLabel('api');
      } catch {
        if (!isMounted) {
          return;
        }

        setCategories(previewCategories);
        setDishes(visiblePreviewDishes);
        setSourceLabel('preview');
        setNotice({
          tone: 'info',
          text: 'Backend non raggiungibile: il menu mostra i dati seed di fallback e la conferma ordine rimane disattivata.',
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadMenu();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryFilters = ['Tutti', ...categories.map((category) => category.name)];
  const visibleDishes =
    selectedCategory === 'Tutti'
      ? dishes
      : dishes.filter((dish) => dish.categoryName === selectedCategory);

  async function handleConfirmOrder() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/menu' } });
      return;
    }

    if (sourceLabel !== 'api') {
      setNotice({
        tone: 'info',
        text: 'Per confermare un ordine devi avere il backend attivo e raggiungibile.',
      });
      return;
    }

    if (items.length === 0) {
      setNotice({
        tone: 'info',
        text: 'Aggiungi almeno un piatto al carrello prima di confermare.',
      });
      return;
    }

    setIsSubmittingOrder(true);
    setNotice(null);

    try {
      const createdOrder = await createOrder({
        notes: notes.trim() || undefined,
        items: items.map((item) => ({
          dishId: item.dishId,
          quantity: item.quantity,
        })),
      });

      clear();
      setNotes('');
      navigate('/orders', {
        state: {
          message: `Ordine #${createdOrder.id} confermato con successo.`,
        },
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        text: getApiErrorMessage(
          error,
          'Creazione ordine non riuscita. Controlla il backend e riprova.',
        ),
      });
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  return (
    <PageLayout
      title="Menu"
      subtitle="Il menu mostra i dati reali del backend quando disponibili. Il flusso finale qui e la conferma ordine, non il pagamento."
      actions={
        <span className="source-pill">
          {sourceLabel === 'api' ? 'Dati backend' : 'Fallback seed locale'}
        </span>
      }
    >
      <section className="filter-row">
        {categoryFilters.map((category) => (
          <button
            key={category}
            type="button"
            className={`chip${selectedCategory === category ? ' chip--active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </section>

      {notice ? (
        <section className={`status-banner status-banner--${notice.tone}`}>
          {notice.text}
        </section>
      ) : null}

      {isLoading ? (
        <section className="surface empty-state">
          <h2>Caricamento menu</h2>
          <p>Sto recuperando categorie e piatti dal backend.</p>
        </section>
      ) : (
        <section className="menu-grid">
          <div className="dish-grid">
            {visibleDishes.map((dish) => (
              <article key={dish.id} className="surface dish-card">
                <div className="dish-card__image-wrap">
                  <img
                    className="dish-card__image"
                    src={dish.imageUrl}
                    alt={dish.name}
                  />
                </div>

                <div className="dish-card__meta">
                  <span className="dish-tag">{dish.categoryName}</span>
                  <span
                    className={`availability${dish.isAvailable ? '' : ' availability--off'}`}
                  >
                    {dish.isAvailable ? 'Disponibile' : 'Esaurito'}
                  </span>
                </div>

                <div className="dish-card__body">
                  <h2>{dish.name}</h2>
                  <p>{dish.description}</p>
                </div>

                <div className="dish-card__footer">
                  <strong className="price-pill">{formatCurrency(dish.price)}</strong>
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() =>
                      addItem({
                        dishId: dish.id,
                        dishName: dish.name,
                        price: dish.price,
                        categoryName: dish.categoryName,
                      })
                    }
                    disabled={!dish.isAvailable}
                  >
                    Aggiungi
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="surface cart-panel">
            <div className="cart-panel__header">
              <h2>Carrello</h2>
              <p>
                {items.length > 0
                  ? `${items.length} righe selezionate. Il backend non gestisce pagamenti: qui si conferma direttamente l'ordine.`
                  : 'Aggiungi uno o piu piatti per preparare un ordine.'}
              </p>
            </div>

            {items.length === 0 ? (
              <div className="empty-state">
                <h3>Nessun piatto selezionato</h3>
                <p>Aggiungi un piatto dal menu per preparare il tuo ordine.</p>
              </div>
            ) : (
              <div className="cart-list">
                {items.map((item) => (
                  <article key={item.dishId} className="cart-item">
                    <div>
                      <h3>{item.dishName}</h3>
                      <p>{item.categoryName}</p>
                      <strong>{formatCurrency(item.price * item.quantity)}</strong>
                    </div>

                    <div className="cart-item__controls">
                      <button
                        type="button"
                        className="mini-button"
                        onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        className="mini-button"
                        onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="mini-button mini-button--danger"
                        onClick={() => removeItem(item.dishId)}
                      >
                        x
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <label className="field">
              <span>Note per l&apos;ordine</span>
              <textarea
                className="textarea"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Aggiungi eventuali richieste per la cucina"
              />
            </label>

            <div className="summary-card">
              <span>Totale</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>

            <button
              type="button"
              className="button button--primary button--full"
              onClick={handleConfirmOrder}
              disabled={isSubmittingOrder || items.length === 0 || sourceLabel !== 'api'}
            >
              {isSubmittingOrder ? 'Conferma in corso...' : 'Conferma ordine'}
            </button>

            {!isAuthenticated ? (
              <p className="form-note">
                Per confermare l&apos;ordine devi prima effettuare il login.
              </p>
            ) : null}
          </aside>
        </section>
      )}
    </PageLayout>
  );
}
