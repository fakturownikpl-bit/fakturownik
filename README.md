# Fakturownik 🔧

> Prosta aplikacja do fakturowania dla hydraulików, elektryków i małych firm usługowych.

## Stack

- **Next.js 15** (App Router, Turbopack)
- **TypeScript** — pełne typowanie wszystkich danych
- **Tailwind CSS v4** — responsywność + Dark Mode
- **Supabase** — baza danych + auth (opcjonalnie)

---

## Szybki start

```bash
# 1. Zainstaluj zależności
npm install

# 2. Skonfiguruj zmienne środowiskowe
cp .env.local.example .env.local
# (edytuj .env.local — Supabase jest opcjonalne na start)

# 3. Uruchom serwer deweloperski
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

---

## Struktura projektu

```
src/
├── app/                    # App Router — strony
│   ├── dashboard/          # Panel główny
│   ├── faktury/            # Lista faktur
│   │   └── nowa/           # Nowa faktura
│   ├── klienci/            # Klienci
│   └── ustawienia/         # Ustawienia firmy
├── components/
│   ├── ui/                 # Primitives: Button, Card, Modal…
│   ├── layout/             # AppShell, Sidebar
│   ├── faktury/            # InvoiceTable, InvoiceForm, InvoicePreview
│   └── klienci/            # (rozszerzalny)
├── hooks/
│   └── useAppState.tsx     # Global state (Context + useReducer)
├── lib/
│   ├── utils.ts            # Obliczenia, formatowanie
│   ├── seed.ts             # Dane demonstracyjne
│   └── supabase.ts         # Klient Supabase + typy DB
└── types/
    └── index.ts            # Wszystkie interfejsy TypeScript
```

---

## Supabase — konfiguracja (opcjonalna)

### 1. Utwórz projekt

Wejdź na [supabase.com](https://supabase.com) → New project.

### 2. Uruchom schemat SQL

W Supabase SQL Editor wklej zawartość `supabase/schema.sql`.

### 3. Uzupełnij `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 4. (Opcjonalnie) Wygeneruj typy

```bash
npx supabase gen types typescript --project-id <twoje-id> \
  > src/lib/database.types.ts
```

> **Uwaga:** Bez Supabase aplikacja działa w pełni lokalnie (localStorage).  
> Przejście na Supabase wymaga podłączenia hooków w `useAppState.tsx`  
> do funkcji z `supabase.ts` zamiast lokalnego reduktora.

---

## Funkcje

| Funkcja | Opis |
|---|---|
| **Dashboard** | Statystyki, ostatnie faktury, klienci |
| **Faktury** | Lista z filtrami, podgląd, oznaczanie jako opłacona |
| **Nowa faktura** | Dynamiczne pozycje, VAT, termin, PDF-ready |
| **Klienci** | CRUD, wyszukiwarka, historia faktur |
| **Ustawienia** | Dane firmy, motyw (jasny/ciemny/systemowy) |
| **Dark Mode** | Pełna obsługa, zapis preferencji |
| **Mobile** | Responsive sidebar z hamburger menu |
| **localStorage** | Dane persystują bez backendu |

---

## Roadmap (następne kroki)

- [ ] Eksport PDF (np. `@react-pdf/renderer`)
- [ ] Wysyłka e-mail (Resend)
- [ ] Przypomnienia o płatnościach
- [ ] Autentykacja Supabase Auth
- [ ] Synchronizacja danych w chmurze
- [ ] Raporty miesięczne / roczne

---

## Licencja

MIT
