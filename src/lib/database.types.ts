export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      klienci: {
        Row: {
          id: number
          user_id: string
          nazwa: string
          email: string
          tel: string
          adres: string
          nip: string
          created_at: string
        }
        Insert: {
          user_id: string
          nazwa: string
          email?: string
          tel?: string
          adres?: string
          nip?: string
        }
        Update: {
          nazwa?: string
          email?: string
          tel?: string
          adres?: string
          nip?: string
        }
      }
      faktury: {
        Row: {
          id: string
          user_id: string
          klient_id: number | null
          data: string
          termin: string
          status: 'oplacona' | 'nieoplacona' | 'projekt' | 'przeterminowana'
          pozycje: Json
          uwagi: string
          created_at: string
        }
        Insert: {
          id: string
          user_id: string
          klient_id?: number | null
          data: string
          termin: string
          status: 'oplacona' | 'nieoplacona' | 'projekt' | 'przeterminowana'
          pozycje: Json
          uwagi?: string
        }
        Update: {
          klient_id?: number | null
          data?: string
          termin?: string
          status?: 'oplacona' | 'nieoplacona' | 'projekt' | 'przeterminowana'
          pozycje?: Json
          uwagi?: string
        }
      }
      firmy: {
        Row: {
          id: number
          user_id: string
          nazwa: string
          nip: string
          adres: string
          email: string
          tel: string
          nr_konta: string
        }
        Insert: {
          user_id: string
          nazwa?: string
          nip?: string
          adres?: string
          email?: string
          tel?: string
          nr_konta?: string
        }
        Update: {
          nazwa?: string
          nip?: string
          adres?: string
          email?: string
          tel?: string
          nr_konta?: string
        }
      }
    }
  }
}
