import type { Client, Company, Invoice } from '@/types'

export const DEMO_COMPANY: Company = {
  nazwa: 'Jan Kowalski Hydraulik',
  nip: '123-456-78-90',
  adres: 'ul. Krakowska 5, 30-001 Kraków',
  email: 'jan@kowalski-hydraulik.pl',
  tel: '604 123 456',
  nr_konta: 'PL61 1090 1014 0000 0712 1981 2874',
}

export const DEMO_CLIENTS: Client[] = [
  {
    id: 1,
    nazwa: 'Marek Wiśniewski',
    email: 'marek.wisniewski@gmail.com',
    tel: '512 345 678',
    adres: 'ul. Słowackiego 12, 31-010 Kraków',
    nip: '',
  },
  {
    id: 2,
    nazwa: 'Firma Budowlana ABC Sp. z o.o.',
    email: 'biuro@abc-bud.pl',
    tel: '012 345 67 89',
    adres: 'ul. Przemysłowa 44, 32-020 Wieliczka',
    nip: '678-123-45-67',
  },
  {
    id: 3,
    nazwa: 'Anna Nowak',
    email: 'anna.nowak@wp.pl',
    tel: '601 987 654',
    adres: 'os. Złotego Wieku 8/14, 31-618 Kraków',
    nip: '',
  },
]

export const DEMO_INVOICES: Invoice[] = [
  {
    id: 'FV/2026/05/001',
    klientId: 1,
    data: '2026-05-10',
    termin: '2026-05-24',
    status: 'oplacona',
    pozycje: [
      { opis: 'Naprawa rury — kuchnia', ilosc: 1, cena: 250, vat: 23 },
      { opis: 'Rura miedziana 15mm (2m)', ilosc: 2, cena: 28, vat: 23 },
    ],
    uwagi: 'Pilna naprawa — wykonano tego samego dnia.',
  },
  {
    id: 'FV/2026/05/002',
    klientId: 2,
    data: '2026-05-20',
    termin: '2026-06-03',
    status: 'nieoplacona',
    pozycje: [
      { opis: 'Montaż instalacji c.o. — parter', ilosc: 1, cena: 1800, vat: 8 },
      { opis: 'Rury i złączki (komplet)', ilosc: 1, cena: 420, vat: 23 },
    ],
    uwagi: 'Etap 1 z 3. Kolejny etap: piętro pierwsze.',
  },
  {
    id: 'FV/2026/06/001',
    klientId: 3,
    data: '2026-06-01',
    termin: '2026-06-15',
    status: 'projekt',
    pozycje: [
      { opis: 'Przegląd kotła gazowego', ilosc: 1, cena: 180, vat: 23 },
      { opis: 'Wymiana zaworu bezpieczeństwa', ilosc: 1, cena: 95, vat: 23 },
    ],
    uwagi: '',
  },
]
