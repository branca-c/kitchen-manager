# Kitchen Manager

## 🚀 Configurazione Rapida Ambiente (Backend)

Questo documento spiega come configurare o resettare velocemente l'ambiente di sviluppo locale per il progetto Kitchen Manager.

### 1. Cosa fare (Esecuzione)

Ogni volta che cloni il progetto da zero, elimini il database (`db.sqlite3`) o hai bisogno di riallineare i dati, esegui questo comando dal terminale nella cartella `backend/`:

```
./setup_dev.sh
```

### 🍎 Nota per utenti Mac
Se ricevi un errore di "permessi negati" (Permission denied), dai i permessi di esecuzione allo script una sola volta con:

```
chmod +x setup_dev.sh
```

### 2. Cosa fa lo script?
Per garantire che tutto il team lavori con gli stessi standard, lo script esegue automaticamente tre fasi critiche:

1. **Migrazioni**: Allinea le tabelle del database all'ultima versione.
2. **Seed Admin**: Crea o aggiorna l'account amministratore (`admin`/`admin123`) con ruolo di business `admin`.
3. **Seed Menu**: Genera automaticamente categorie e piatti di test, inclusi casi limite per la UX.

### 3. Credenziali di Accesso Admin
D'ora in poi, per i test nel pannello di amministrazione (`/admin/`), usa sempre queste credenziali:

1. **Username**: `admin`
2. **Password**: `admin123`

### 4. Perché usare questo comando?
- **Velocità**: Configura l'intero database (utenti + piatti) in un solo colpo.
- **Test Soft Delete**: Il seed include piatti con `is_active=False` per testare che rimangano nello storico ordini senza essere visibili nel menu pubblico.
- **Test Disponibilità**: Include piatti con `is_available=False` per verificare la gestione dei prodotti "Sold Out" nel frontend.
- **Pattern Observer**: Permette di testare immediatamente i Signals (decremento scorte e sblocco recensioni) usando dati reali e coerenti

### 5. Configurazione Gemini API Key

Per motivi di sicurezza e per evitare di consumare la quota gratuita condivisa, ogni persona deve usare la propria chiave Gemini in locale.

Puoi partire dal file di esempio:

```bash
cp backend/.env.example backend/.env
```

### Come impostarla in 1 minuto

1. Vai su Google AI Studio.
2. Clicca su Get API Key.
3. Apri il file `backend/.env` locale.
4. Inserisci questa riga:

```bash
GEMINI_API_KEY=tua_chiave_qui
```

5. Riavvia il server backend.
6. L'endpoint `GET /api/reviews/ai-summary/` sara attivo.

**Verifica locale**
Dopo aver salvato tutto:

1. crea `backend/.env` a partire da `backend/.env.example`
2. inserisci la tua chiave personale
3. avvia il backend da `backend/`
4. testa l'endpoint oppure il bottone nella pagina admin recensioni

Esempio:

```bash
cd backend
python3 manage.py runserver
```
