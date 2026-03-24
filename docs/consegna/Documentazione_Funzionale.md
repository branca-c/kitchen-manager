# Documentazione Funzionale

## 1. Introduzione

**Kitchen Manager** è un progetto pensato per digitalizzare e semplificare la gestione degli ordini in un contesto ristorativo. L'applicazione nasce con l'obiettivo di offrire un flusso chiaro sia per il cliente sia per l'amministratore del ristorante, mettendo in comunicazione il menu, gli ordini, lo storico e le recensioni all'interno di un'unica piattaforma.

L'idea centrale del progetto è quella di creare un'esperienza semplice e immediata:

- il cliente può consultare il menu, autenticarsi, confermare un ordine e seguirne lo stato
- l'amministratore può monitorare tutti gli ordini e aggiornarne l'avanzamento
- una volta completato il servizio, il cliente può lasciare una recensione
- il sistema può infine fornire un supporto AI per sintetizzare i feedback ricevuti

Il progetto è stato sviluppato come applicazione full stack, con backend e frontend separati ma strettamente integrati.

---

## 2. Obiettivo del sistema

L'obiettivo principale di Kitchen Manager è migliorare l'organizzazione del flusso di ordinazione e comunicazione tra cliente e ristorante.

Dal punto di vista del cliente, il sistema permette di:

- accedere facilmente al menu
- selezionare i piatti desiderati
- inviare un ordine in modo strutturato
- controllare l'avanzamento del proprio ordine
- lasciare un feedback finale

Dal punto di vista dell'amministratore, il sistema permette di:

- visualizzare tutti gli ordini in arrivo
- tenere traccia dello stato di preparazione
- aggiornare in modo ordinato il ciclo di vita di ogni ordine
- analizzare le recensioni ricevute

In questo modo, l'applicazione non è soltanto una vetrina del menu, ma uno strumento gestionale completo per il servizio.

---

## 3. Utenti del sistema

Il sistema prevede due ruoli principali.

### Cliente

Il cliente rappresenta l'utente finale che utilizza l'app per:

- registrarsi
- accedere al sistema
- consultare il menu
- comporre un ordine
- verificare lo storico dei propri ordini
- inserire una recensione su un ordine consegnato

### Amministratore

L'amministratore rappresenta il personale del ristorante che gestisce la parte operativa. Può:

- autenticarsi con privilegi elevati
- visualizzare tutti gli ordini presenti nel sistema
- aggiornare lo stato di avanzamento degli ordini
- accedere alla sezione di analisi AI delle recensioni

La distinzione dei ruoli consente di mostrare a ciascun utente solo le funzioni realmente pertinenti.

---

## 4. Descrizione generale del funzionamento

Il funzionamento di Kitchen Manager è basato su un flusso progressivo.

Il cliente entra nell'applicazione e visualizza il menu. I piatti sono organizzati per categorie e riportano informazioni essenziali come nome, descrizione, prezzo e disponibilità. Quando un piatto è esaurito, il sistema lo segnala chiaramente e ne impedisce l'inserimento nell'ordine.

Una volta autenticato, il cliente può aggiungere i piatti desiderati al carrello. Il carrello non rappresenta un pagamento online, ma una fase di composizione dell'ordine. L'utente può modificare quantità, rimuovere prodotti e aggiungere note per la cucina. Quando il contenuto è corretto, conferma l'ordine.

Dopo la conferma, l'ordine entra nel sistema con uno stato iniziale e compare nello storico del cliente. Da qui in avanti il flusso passa all'amministratore, che visualizza l'ordine nella propria area gestionale e ne aggiorna lo stato fino al completamento.

Quando l'ordine risulta consegnato, il cliente può inserire una recensione con punteggio e commento. In presenza di un numero sufficiente di recensioni e con configurazione AI attiva, l'amministratore può ottenere una sintesi automatica dei feedback, utile per estrarre insight sulla qualità del servizio e dei piatti.

---

## 5. Funzionalità principali

## 5.1 Registrazione e autenticazione

Il sistema consente la registrazione di nuovi utenti customer. La registrazione richiede i dati necessari per creare un account e permette successivamente l'accesso tramite login.

L'autenticazione è gestita in modo sicuro tramite token JWT. Questo approccio permette al frontend di dialogare con il backend mantenendo separate le responsabilità tra interfaccia e logica applicativa.

L'utente amministratore viene invece creato tramite seed locale, in modo da avere un accesso di test stabile durante lo sviluppo e la demo.

---

## 5.2 Visualizzazione del menu

Il menu rappresenta il punto di ingresso principale dell'applicazione dal lato cliente.

I piatti vengono mostrati per categoria e ogni voce include:

- nome
- descrizione
- prezzo
- categoria
- stato di disponibilità

Un aspetto importante del progetto è la gestione della disponibilità:

- un piatto attivo e disponibile è visibile e ordinabile
- un piatto attivo ma non disponibile è visibile come esaurito
- un piatto non attivo non viene mostrato nel menu pubblico

Questo comportamento rende il sistema coerente con le esigenze di un ristorante reale, dove alcuni elementi possono essere temporaneamente terminati oppure rimossi dal menu senza essere eliminati dal database.

---

## 5.3 Carrello e conferma ordine

Il carrello consente al cliente di costruire il proprio ordine in modo progressivo.

L'utente può:

- aggiungere piatti
- aumentare o diminuire la quantità
- rimuovere una voce
- inserire eventuali note
- vedere il totale dell'ordine

È importante sottolineare che il progetto, allo stato attuale, non implementa un sistema di pagamento online. Per questo motivo il flusso corretto è quello di **conferma ordine** e non di checkout economico.

La conferma dell'ordine crea un nuovo ordine nel backend con le relative righe, il totale e lo stato iniziale.

---

## 5.4 Storico ordini

Una volta confermato, l'ordine viene salvato e reso visibile nello storico dell'utente.

Questa sezione permette al cliente di:

- consultare gli ordini effettuati
- vedere data e ora dell'ordine
- leggere le note inserite
- verificare il totale
- controllare lo stato corrente dell'ordine

Lo storico è uno degli elementi fondamentali del progetto, perché collega la parte di ordering alla parte di monitoraggio del servizio.

---

## 5.5 Gestione dello stato dell'ordine

Il sistema prevede un ciclo di vita preciso dell'ordine:

- ricevuto
- in preparazione
- pronto
- consegnato

L'amministratore può far avanzare un ordine solo nello stato successivo previsto. Questo vincolo evita transizioni incoerenti e simula un flusso realistico di lavoro in cucina.

Dal punto di vista funzionale, questa caratteristica ha due vantaggi:

- offre al cliente una visione chiara dell'avanzamento
- fornisce all'amministratore un pannello operativo semplice ma efficace

---

## 5.6 Recensioni

Le recensioni rappresentano la parte finale del percorso cliente.

Un utente può recensire solo un ordine che:

- appartenga a lui
- sia stato consegnato

Ogni ordine può ricevere una sola recensione. La recensione è composta da:

- valutazione numerica
- commento testuale

Questo approccio permette di collegare il feedback direttamente a un'esperienza reale di acquisto e non a un parere generico sul locale.

Dal punto di vista funzionale, le recensioni hanno un duplice scopo:

- aumentare il coinvolgimento del cliente
- fornire dati utili all'analisi amministrativa

---

## 5.7 Analisi AI delle recensioni

Una delle funzionalità più evolute del progetto è l'integrazione con un servizio AI per l'analisi dei feedback.

L'idea è quella di offrire all'amministratore una sintesi automatica delle recensioni, con particolare attenzione a:

- punteggio medio percepito
- eventuali criticità ricorrenti
- piatto più apprezzato
- suggerimento operativo finale

Questa funzionalità ha senso soprattutto come strumento di supporto decisionale. Invece di leggere manualmente tutte le recensioni, l'amministratore può ottenere una panoramica immediata dei trend principali.

Dal punto di vista operativo, l'analisi AI richiede:

- una chiave `GEMINI_API_KEY` configurata nel backend
- almeno 3 recensioni utili
- commenti sufficientemente descrittivi

Se questa configurazione manca, l'applicazione continua comunque a funzionare in tutte le sue altre parti.

---

## 6. Regole funzionali importanti

Durante lo sviluppo del progetto sono state definite alcune regole di business fondamentali.

### Regole sugli ordini

- un ordine deve contenere almeno un piatto
- uno stesso piatto non deve essere inviato più volte come righe duplicate nello stesso ordine
- i piatti non attivi o non disponibili non possono essere ordinati

### Regole sugli stati

- l'amministratore può avanzare l'ordine solo al prossimo stato previsto
- un ordine consegnato non può più essere modificato

### Regole sulle recensioni

- un cliente non può recensire ordini di altri utenti
- un ordine non consegnato non può essere recensito
- un ordine può avere una sola recensione

Queste regole rendono il sistema più robusto e coerente.

---

## 7. Valore del progetto

Kitchen Manager offre valore su più livelli.

### Valore per il cliente

- esperienza semplice e chiara
- visibilità sul proprio ordine
- possibilità di lasciare feedback

### Valore per il ristorante

- gestione ordinata degli ordini
- riduzione dell'ambiguità sullo stato del servizio
- raccolta strutturata delle recensioni
- possibilità di ottenere insight automatici tramite AI

### Valore didattico

Dal punto di vista accademico, il progetto dimostra:

- progettazione full stack
- separazione frontend/backend
- uso di API REST
- gestione ruoli e permessi
- uso di logica business lato server
- integrazione di un servizio AI esterno

---

## 8. Limiti attuali

Come ogni MVP, il progetto presenta alcuni limiti noti.

### Nessun pagamento reale

Il sistema non implementa un vero pagamento online. L'azione finale lato cliente è quindi la conferma dell'ordine.

### Configurazione AI esterna

La parte AI dipende da una chiave Gemini valida e da una corretta configurazione backend.

### Immagini piatti non gestite dal database

Le immagini dei piatti sono attualmente gestite lato frontend e non sono ancora salvate nel backend come risorsa dinamica.

### Possibili miglioramenti futuri

In una futura estensione si potrebbero aggiungere:

- pagamento online
- upload immagini piatti da backend
- dashboard statistiche
- filtri avanzati sugli ordini
- notifiche real-time

---

## 9. Conclusione

Kitchen Manager è stato progettato come una piattaforma semplice ma completa per la gestione del rapporto tra cliente, ordine e cucina.

Il sistema consente di coprire il cuore del flusso ristorativo:

- consultazione del menu
- autenticazione
- conferma ordine
- monitoraggio stato
- recensione finale
- analisi AI dei feedback

Dal punto di vista funzionale, il progetto è già in grado di dimostrare una catena di utilizzo coerente e concreta. Le funzionalità attuali sono sufficienti per mostrare sia una prospettiva utente sia una prospettiva gestionale, lasciando spazio a futuri ampliamenti.
