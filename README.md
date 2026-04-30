# Cloudbeds Booking App

Next.js App Router project untuk cek availability dan membuat booking ke Cloudbeds API.

## Setup

1. Copy env template.

```bash
cp .env.example .env
```

2. Isi env wajib di `.env`.

- `CLOUDBEDS_CLIENT_ID`
- `CLOUDBEDS_SECRET`

Untuk akun/endpoint Cloudbeds yang memakai `x-api-key`:

- `CLOUDBEDS_API_KEY` (opsional)
- Jika `CLOUDBEDS_CLIENT_ID` bernilai `cbat_...`, nilai itu otomatis dipakai sebagai API key.

3. (Opsional) Isi env tambahan bila diperlukan.

- `CLOUDBEDS_PROPERTY_ID`
- `CLOUDBEDS_TOKEN_URL`
- `CLOUDBEDS_API_BASE_URL`
- `CLOUDBEDS_AVAILABILITY_PATH`
- `CLOUDBEDS_BOOKING_PATH`

4. Jalankan aplikasi.

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Booking Flow

1. Cari availability kamar.
2. Pilih room yang tersedia.
3. Isi data tamu.
4. Submit booking.

Internal endpoint yang dipakai frontend:

- `POST /api/cloudbeds/availability`
- `POST /api/cloudbeds/bookings`

Cloudbeds credential hanya dipakai di server-side route handler dan service client.

## Catatan Penting

- Endpoint Cloudbeds dapat berbeda antar akun atau versi API.
- Jika API mengembalikan 404/405, isi path override di env.
- Implementasi saat ini fokus pada availability + create reservation.
