# Fakturownik — Instrukcja konfiguracji Supabase Auth

## Co zostało dodane

| Plik | Opis |
|---|---|
| `src/middleware.ts` | Ochrona tras — niezalogowany użytkownik trafia na `/auth/login` |
| `src/lib/supabase.ts` | Klient przeglądarkowy (SSR-safe) |
| `src/lib/supabase-server.ts` | Klient serwerowy (dla Server Components / Route Handlers) |
| `src/lib/database.types.ts` | Typy TypeScript wygenerowane ze schematu |
| `src/app/auth/login/page.tsx` | Strona logowania |
| `src/app/auth/rejestracja/page.tsx` | Strona rejestracji + potwierdzenie e-mail |
| `src/app/auth/reset-hasla/page.tsx` | Prośba o link resetujący hasło |
| `src/app/auth/nowe-haslo/page.tsx` | Ustawienie nowego hasła (po kliknięciu linku) |
| `src/app/auth/callback/route.ts` | Route Handler — wymiana kodu OAuth/e-mail na sesję |
| `src/hooks/useAppState.tsx` | **Przebudowany** — Supabase zamiast localStorage, RLS zapewnia izolację danych |
| `src/components/layout/Sidebar.tsx` | Dodany przycisk wylogowania + e-mail użytkownika |
| `supabase/schema.sql` | Zaktualizowany — dodano `with check` do polityk RLS |

---

## Krok 1 — Utwórz projekt Supabase

1. Wejdź na [app.supabase.com](https://app.supabase.com) i kliknij **New project**.
2. Wypełnij nazwę, hasło bazy i region (najlepiej `eu-central-1` — Frankfurt).
3. Poczekaj ~2 minuty na inicjalizację.

---

## Krok 2 — Uruchom schemat bazy

1. W panelu Supabase przejdź do **SQL Editor → New query**.
2. Wklej całą zawartość pliku `supabase/schema.sql`.
3. Kliknij **Run** (lub `Ctrl+Enter`).

Sprawdź w **Table Editor**, że pojawiły się tabele: `firmy`, `klienci`, `faktury`.

---

## Krok 3 — Skonfiguruj zmienne środowiskowe

1. W panelu Supabase przejdź do **Settings → API**.
2. Skopiuj:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Utwórz plik `.env.local` w katalogu projektu:

```bash
cp .env.local.example .env.local
```

4. Wklej skopiowane wartości:

```env
NEXT_PUBLIC_SUPABASE_URL=https://twoj-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Krok 4 — Skonfiguruj e-maile Auth (URL przekierowania)

1. W panelu Supabase przejdź do **Authentication → URL Configuration**.
2. Ustaw **Site URL**:
   - Developerment: `http://localhost:3000`
   - Produkcja: `https://twoja-domena.pl`
3. W sekcji **Redirect URLs** dodaj:
   - `http://localhost:3000/auth/callback`
   - `https://twoja-domena.pl/auth/callback` (produkcja)

---

## Krok 5 — (Opcjonalnie) Dostosuj szablony e-mail

W panelu: **Authentication → Email Templates**.

Dostępne szablony:
- **Confirm signup** — aktywacja konta po rejestracji
- **Reset password** — link resetujący hasło
- **Magic Link** — logowanie bez hasła (jeśli włączone)

Możesz zmienić nadawcę, temat i treść każdego e-maila.

---

## Krok 6 — Zainstaluj zależności i uruchom

```bash
npm install
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000) — zostaniesz przekierowany na stronę logowania.

---

## Jak działa izolacja danych (RLS)

Każda tabela (`firmy`, `klienci`, `faktury`) ma włączone **Row Level Security** z polityką:

```sql
-- Przykład dla klienci
create policy "Użytkownik widzi tylko swoich klientów"
  on klienci for all
  using (auth.uid() = user_id)         -- filtruje SELECT/UPDATE/DELETE
  with check (auth.uid() = user_id);   -- blokuje INSERT z cudzym user_id
```

Oznacza to, że:
- Zapytanie `SELECT * FROM klienci` zwróci **tylko** rekordy zalogowanego użytkownika.
- Próba insertu z innym `user_id` zostanie **zablokowana na poziomie bazy**.
- Nawet jeśli frontend wyśle błędne zapytanie, baza danych odrzuci dostęp.

---

## Przepływ uwierzytelniania

```
/                         → middleware → /auth/login (niezalogowany)
/auth/login               → signInWithPassword → /dashboard
/auth/rejestracja         → signUp → e-mail z linkiem aktywacyjnym
  link w e-mailu          → /auth/callback?code=... → wymiana kodu → /dashboard
/auth/reset-hasla         → resetPasswordForEmail → e-mail z linkiem
  link w e-mailu          → /auth/callback?code=...&next=/auth/nowe-haslo
/auth/nowe-haslo          → updateUser({ password }) → /dashboard
Sidebar → "Wyloguj się"   → signOut → /auth/login
```

---

## Produkcja — dodatkowe kroki

1. **Własna domena SMTP** — Supabase ma limit 4 e-maili/godz. na darmowym planie. W panelu: **Settings → Auth → SMTP Settings** skonfiguruj np. SendGrid, Resend lub Mailgun.

2. **Zmienne env na serwerze** — dodaj te same zmienne w ustawieniach hostingu (Vercel, Netlify itp.).

3. **Generowanie typów z CLI** (opcjonalne, po zmianach w bazie):
   ```bash
   npx supabase gen types typescript --project-id TWOJ_PROJECT_ID > src/lib/database.types.ts
   ```

---

## Rozwiązywanie problemów

| Objaw | Przyczyna | Rozwiązanie |
|---|---|---|
| Przekierowanie w nieskończoność na `/auth/login` | Brak zmiennych env | Sprawdź `.env.local` |
| „Invalid login credentials" | Konto nieaktywowane | Kliknij link w e-mailu aktywacyjnym |
| Link z e-maila daje 404 | Zły Redirect URL | Dodaj URL w Auth → URL Configuration |
| Dane innego użytkownika widoczne | RLS wyłączone | Uruchom `schema.sql` ponownie |
| E-mail nie dochodzi | Limit Supabase (4/godz.) | Skonfiguruj własny SMTP |
