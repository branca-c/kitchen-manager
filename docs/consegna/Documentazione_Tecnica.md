# Documentazione Tecnica

## 1. Obiettivo del progetto

**Kitchen Manager** è un'applicazione full stack per la gestione di:

- visualizzazione del menu
- autenticazione utenti
- creazione ordini
- monitoraggio dello stato degli ordini
- recensioni post-consegna
- analisi AI delle recensioni lato amministratore

Il progetto è organizzato in due macroaree:

- **backend** in Django + Django REST Framework
- **frontend** in React + TypeScript + Vite

---

## 2. Stack tecnologico

### Backend

- Python
- Django
- Django REST Framework
- Simple JWT per autenticazione
- SQLite come database locale
- Google Gemini tramite `google-genai` per la parte AI

### Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- CSS custom con design system leggero

---

## 3. Struttura del repository

```text
kitchen-manager/
  backend/
    config/
    core/
    menu/
    manage.py
    requirements.txt
    setup_dev.sh
  frontend/
    public/
    src/
    package.json
    vite.config.ts
  docs/
```

### Cartella `backend/`

Contiene tutta la logica server-side:

- modelli
- serializers
- API REST
- seed iniziale
- logica AI

### Cartella `frontend/`

Contiene l'interfaccia utente:

- routing
- gestione stato auth/carrello
- pagine cliente/admin
- integrazione con le API

### Cartella `docs/`

Contiene la documentazione di progetto:

- setup ambiente
- piano frontend
- guida stile
- wireframe
- documentazione tecnica

---

## 4. Architettura backend

Il backend è diviso principalmente in due app Django:

### `core`

Gestisce:

- utenti
- categorie
- piatti
- ordini
- righe ordine
- recensioni
- autenticazione
- AI summary

File principali:

- [backend/core/models.py](/Users/elisabettafino/Desktop/kitchen-manager/backend/core/models.py)
- [backend/core/serializers.py](/Users/elisabettafino/Desktop/kitchen-manager/backend/core/serializers.py)
- [backend/core/views.py](/Users/elisabettafino/Desktop/kitchen-manager/backend/core/views.py)
- [backend/core/api/orders/views.py](/Users/elisabettafino/Desktop/kitchen-manager/backend/core/api/orders/views.py)
- [backend/core/services.py](/Users/elisabettafino/Desktop/kitchen-manager/backend/core/services.py)

### `menu`

Contiene un secondo dominio menu con modelli in italiano e logica observer/storico.

File principali:

- [backend/menu/models.py](/Users/elisabettafino/Desktop/kitchen-manager/backend/menu/models.py)
- [backend/menu/views.py](/Users/elisabettafino/Desktop/kitchen-manager/backend/menu/views.py)

Nota:

Il frontend attuale utilizza le API pubblicate sotto `core`, cioè:

- `/api/categories/`
- `/api/dishes/`
- `/api/orders/`
- `/api/reviews/`

---

## 5. Architettura frontend

Il frontend è organizzato in moduli piccoli e separati.

### Entry point

- [frontend/src/main.tsx](/Users/elisabettafino/Desktop/kitchen-manager/frontend/src/main.tsx)
- [frontend/src/App.tsx](/Users/elisabettafino/Desktop/kitchen-manager/frontend/src/App.tsx)

### API layer

Tutte le chiamate al backend passano dai moduli `api/`:

- [frontend/src/api/client.ts](/Users/elisabettafino/Desktop/kitchen-manager/frontend/src/api/client.ts)
- [frontend/src/api/auth.ts](/Users/elisabettafino/Desktop/kitchen-manager/frontend/src/api/auth.ts)
- [frontend/src/api/menu.ts](/Users/elisabettafino/Desktop/kitchen-manager/frontend/src/api/menu.ts)
- [frontend/src/api/orders.ts](/Users/elisabettafino/Desktop/kitchen-manager/frontend/src/api/orders.ts)
- [frontend/src/api/reviews.ts](/Users/elisabettafino/Desktop/kitchen-manager/frontend/src/api/reviews.ts)

### State management

Lo stato condiviso è gestito tramite React Context:

- [frontend/src/context/AuthContext.tsx](/Users/elisabettafino/Desktop/kitchen-manager/frontend/src/context/AuthContext.tsx)
- [frontend/src/context/CartContext.tsx](/Users/elisabettafino/Desktop/kitchen-manager/frontend/src/context/CartContext.tsx)

### Routing

Le rotte protette sono gestite da:

- [frontend/src/routes/ProtectedRoute.tsx](/Users/elisabettafino/Desktop/kitchen-manager/frontend/src/routes/ProtectedRoute.tsx)
- [frontend/src/routes/AdminRoute.tsx](/Users/elisabettafino/Desktop/kitchen-manager/frontend/src/routes/AdminRoute.tsx)

### Pagine principali

- [frontend/src/pages/HomePage.tsx](/Users/elisabettafino/Desktop/kitchen-manager/frontend/src/pages/HomePage.tsx)
- [frontend/src/pages/LoginPage.tsx](/Users/elisabettafino/Desktop/kitchen-manager/frontend/src/pages/LoginPage.tsx)
- [frontend/src/pages/RegisterPage.tsx](/Users/elisabettafino/Desktop/kitchen-manager/frontend/src/pages/RegisterPage.tsx)
- [frontend/src/pages/MenuPage.tsx](/Users/elisabettafino/Desktop/kitchen-manager/frontend/src/pages/MenuPage.tsx)
- [frontend/src/pages/OrdersPage.tsx](/Users/elisabettafino/Desktop/kitchen-manager/frontend/src/pages/OrdersPage.tsx)
- [frontend/src/pages/AdminOrdersPage.tsx](/Users/elisabettafino/Desktop/kitchen-manager/frontend/src/pages/AdminOrdersPage.tsx)

### Stile

Il sistema visivo è centralizzato in:

- [frontend/src/styles/global.css](/Users/elisabettafino/Desktop/kitchen-manager/frontend/src/styles/global.css)

---

## 6. Modello dati principale

### User

Campi principali:

- `username`
- `email`
- `password`
- `role` con valori `admin` o `customer`

### Category

Campi principali:

- `name`

### Dish

Campi principali:

- `name`
- `description`
- `price`
- `category`
- `is_active`
- `is_available`

### Order

Campi principali:

- `user`
- `created_at`
- `status`
- `notes`
- `total_amount`

Stati supportati:

- `received`
- `preparing`
- `ready`
- `delivered`

### OrderItem

Campi principali:

- `order`
- `dish`
- `quantity`
- `unit_price`

### Review

Campi principali:

- `order`
- `rating`
- `comment`
- `created_at`

Nota:

La review è collegata con relazione **OneToOne** all'ordine, quindi un ordine può avere al massimo una recensione.

---

## 7. Autenticazione e ruoli

L'autenticazione usa **JWT** tramite Simple JWT.

Endpoint principali:

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`

### Ruolo `customer`

Può:

- visualizzare categorie e piatti
- creare ordini
- visualizzare solo i propri ordini
- inserire recensioni solo sui propri ordini consegnati

### Ruolo `admin`

Può:

- visualizzare tutti gli ordini
- aggiornare lo stato degli ordini
- visualizzare tutte le recensioni
- richiedere l'analisi AI delle recensioni

Credenziali admin seed locale:

- username: `admin`
- password: `admin123`

---

## 8. API principali

## 8.1 Auth

- `POST /api/auth/register/`
  - crea un nuovo utente customer

- `POST /api/auth/login/`
  - restituisce token JWT, ruolo e user id

- `GET /api/auth/me/`
  - restituisce il profilo dell'utente autenticato

## 8.2 Menu

- `GET /api/categories/`
  - restituisce l'elenco categorie

- `GET /api/dishes/`
  - restituisce i piatti attivi del menu

## 8.3 Orders

- `GET /api/orders/`
  - customer: solo i propri ordini
  - admin: tutti gli ordini

- `POST /api/orders/`
  - crea un ordine con payload tipo:

```json
{
  "notes": "senza cipolla",
  "items": [
    { "dish_id": 1, "quantity": 2 },
    { "dish_id": 5, "quantity": 1 }
  ]
}
```

- `GET /api/orders/<id>/`
  - dettaglio ordine

- `PATCH /api/orders/<id>/status/`
  - disponibile solo per admin
  - accetta solo il prossimo stato valido

Esempio:

```json
{
  "status": "preparing"
}
```

## 8.4 Reviews

- `GET /api/reviews/`
  - customer: solo le proprie review
  - admin: tutte le review

- `POST /api/reviews/`
  - crea una recensione

Payload:

```json
{
  "order": 12,
  "rating": 5,
  "comment": "Ottima esperienza"
}
```

Vincoli:

- l'ordine deve appartenere all'utente
- l'ordine deve essere `delivered`
- l'ordine può avere una sola review

## 8.5 AI Summary

- `GET /api/reviews/ai-summary/`

Disponibile solo per admin.

Possibili casi:

- `403` se chiamato da un customer
- `200` con messaggio informativo se ci sono meno di 3 recensioni
- `200` con risultati AI se la configurazione è corretta
- `200` con errore logico se manca `GEMINI_API_KEY` o se l'AI non restituisce output valido

---

## 9. Flussi applicativi principali

## 9.1 Flusso cliente

1. Registrazione o login
2. Accesso al menu
3. Aggiunta piatti al carrello
4. Inserimento note ordine opzionali
5. Conferma ordine
6. Visualizzazione storico ordini
7. Inserimento recensione quando l'ordine risulta consegnato

Nota:

Il backend **non supporta un pagamento reale**. Il frontend usa quindi correttamente il concetto di **conferma ordine** e non di pagamento.

## 9.2 Flusso admin

1. Login admin
2. Accesso a `Gestione ordini`
3. Visualizzazione di tutti gli ordini
4. Avanzamento stato ordine
5. Accesso all'analisi AI delle recensioni

## 9.3 Flusso review

1. L'utente cliente apre `I miei ordini`
2. Per un ordine con stato `delivered` compare il form recensione
3. L'utente inserisce rating e commento
4. Il backend salva la review e la associa all'ordine

## 9.4 Flusso AI

1. L'admin apre la sezione AI
2. Il frontend chiama `GET /api/reviews/ai-summary/`
3. Il backend aggrega le recensioni
4. `AIService` invia il prompt a Gemini
5. Il backend restituisce un JSON con:

- `sentiment_score`
- `main_complaint`
- `top_dish`
- `advice`

---

## 10. Seed e dati di test

Lo script:

```bash
./setup_dev.sh
```

esegue:

- migrazioni
- seed admin
- seed menu

Categorie seed:

- Pizze
- Burger
- Bevande

Piatti seed principali:

- Margherita
- Diavola
- Bacon Burger
- Coca Cola 33cl

Piatti speciali per test:

- piatti `is_available = False`
- piatti `is_active = False`

Questi casi servono a validare:

- sold out lato frontend
- persistenza storico
- esclusione dal menu pubblico

---

## 11. Configurazione ambiente

## Backend

Dalla cartella `backend/`:

```bash
./setup_dev.sh
python manage.py runserver
```

## Frontend

Dalla cartella `frontend/`:

```bash
npm install
npm run dev
```

Variabile frontend:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

File di esempio:

- [frontend/.env.example](/Users/elisabettafino/Desktop/kitchen-manager/frontend/.env.example)

---

## 12. Configurazione AI

Per la parte AI serve una variabile d'ambiente personale configurata in locale nel file `backend/.env`.

File di esempio:

- [backend/.env.example](/Users/elisabettafino/Desktop/kitchen-manager/backend/.env.example)

Setup rapido:

```bash
cp backend/.env.example backend/.env
```

Poi inserire:

```bash
GEMINI_API_KEY=tua_chiave_qui
```

Il backend legge la chiave tramite:

- `settings.GEMINI_API_KEY`
- oppure variabile ambiente / `.env`

Per motivi di sicurezza e per evitare di consumare la quota gratuita condivisa, ogni sviluppatore deve usare la propria chiave Gemini locale.

Condizioni minime per testare davvero l'AI:

- backend attivo
- `GEMINI_API_KEY` valida
- almeno 3 recensioni
- recensioni con commenti testuali significativi

Dopo il riavvio del backend, l'endpoint `GET /api/reviews/ai-summary/` sara utilizzabile.

Se la chiave manca, la funzionalità AI non blocca il resto dell'app, ma restituisce errore controllato.

---

## 13. Scelte implementative frontend

### Carrello

Il carrello è gestito in memoria applicativa + `localStorage`.

Serve a:

- accumulare piatti
- modificare quantità
- rimuovere righe
- inviare l'ordine finale al backend

### Immagini piatti

Le immagini dei piatti attualmente sono **frontend-only**.

Non esiste ancora un campo immagine nel model `Dish`.

Le immagini sono collocate in:

- [frontend/public/images/dishes](/Users/elisabettafino/Desktop/kitchen-manager/frontend/public/images/dishes)

### Fallback menu

Il frontend prova prima a leggere categorie e piatti dal backend.

Se il backend non è raggiungibile:

- mostra un fallback coerente con il seed
- disabilita la conferma ordine

Questo comportamento aiuta durante sviluppo e demo locali.

---

## 14. Testing effettuato

Sono stati verificati end-to-end i seguenti flussi:

- login
- registrazione
- lettura menu backend
- aggiunta piatti al carrello
- conferma ordine
- visualizzazione storico ordini
- cambio stato ordine lato admin
- visualizzazione form review su ordini consegnati

Inoltre il frontend è stato validato con:

```bash
npm run build
```

---

## 15. Limiti noti / punti aperti

### 1. Nessun pagamento reale

Il backend non gestisce:

- checkout
- payment provider
- transaction id
- payment status

Per questo motivo il flusso corretto è:

- **conferma ordine**

non:

- **pagamento**

### 2. AI dipendente da chiave esterna

La sezione AI richiede `GEMINI_API_KEY`.

Senza chiave:

- l'app funziona comunque
- la sola analisi AI non restituisce insight reali

### 3. Ambiguità route ordini

Nel backend esistono due registrazioni per `orders/` in:

- [backend/core/api/urls.py](/Users/elisabettafino/Desktop/kitchen-manager/backend/core/api/urls.py)

Questo andrebbe pulito per evitare ambiguità future.

### 4. Nessun campo immagine sui piatti nel backend

Attualmente le immagini sono gestite solo lato frontend.

### 5. Test AI dipendenti da dati reali

Per mostrare una demo AI convincente servono:

- almeno 3 review
- commenti utili
- chiave Gemini valida

---

## 16. Possibili sviluppi futuri

- integrazione pagamento reale
- upload immagini piatti da backend
- dashboard statistiche admin
- filtri avanzati ordini
- refresh automatico token
- miglior gestione errori centralizzata
- test frontend automatizzati
- deploy cloud

---

## 17. Conclusione

Il progetto oggi presenta una base tecnica completa per il flusso principale:

- autenticazione
- visualizzazione menu
- creazione ordine
- gestione stato ordine
- recensioni
- predisposizione analisi AI

La parte core applicativa è già utilizzabile e dimostrabile.

Gli unici elementi esterni/non strutturalmente chiusi sono:

- configurazione della chiave Gemini
- eventuale futuro pagamento reale

Questa documentazione può essere usata come base per:

- consegna tecnica
- preparazione slide
- presentazione finale
- onboarding del team
