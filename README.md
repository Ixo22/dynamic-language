# 動的言語 · Dynamic Language

Aprende japonés real con input comprensible, repetición espaciada y práctica activa — diseñado para hispanohablantes.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4**
- **Supabase** — autenticación + progreso SRS por usuario
- **Anthropic Claude** — generación de frases y diálogos
- **wanakana** — conversión romaji → kana para práctica sin teclado japonés

## Funcionalidades

| Sección | Descripción |
|---|---|
| **Lección** | Frases generadas por IA adaptadas al nivel (A1/A2). Popup de vocabulario, audio Web Speech API, traducción y furigana opcionales |
| **Situaciones** | 8 contextos del día a día (supermercado, restaurante, transporte…) con frases reales |
| **Tarjetas** | Flashcards con algoritmo SM-2 (SRS) sincronizado con Supabase |
| **Trazos** | Animación de trazos de kanji (KanjiVG) |
| **Práctica** | Input en romaji con conversión en tiempo real a kana — sin necesidad de teclado japonés |

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
```

## Base de datos

Ejecuta `supabase/schema.sql` en el SQL Editor de tu proyecto Supabase. Crea las tablas `users` y `srs_progress` con Row Level Security activado.

## Desarrollo

```bash
npm install
npm run dev
```
