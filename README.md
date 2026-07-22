# Photobooth Zidan

Photobooth Zidan adalah aplikasi PWA kiosk berbasis Vanilla HTML, CSS, dan JavaScript ES Modules. Mode aktif sementara adalah QR-only: user memilih frame, membayar QRIS statis sebesar Rp15.000, menunjukkan bukti ke kasir, mengambil 4 foto webcam berurutan, menggabungkan semua foto ke frame PNG transparan, lalu menerima QR Code Cloudinary dan download lokal.

## Arsitektur

Frontend berjalan sebagai SPA satu halaman dengan state sederhana di `src/js/state/app-state.js`. Perpindahan layar dikelola oleh `navigateTo(screenName)` di `src/js/router.js`.

Backend berada di folder `api/` sebagai Vercel Serverless Functions untuk upload foto sementara, storage delete, dan cleanup. Integrasi Resend tetap ada di source, tetapi pengiriman email dinonaktifkan selama `ENABLE_EMAIL_DELIVERY=false`. Tidak ada database permanen untuk user, foto, atau pembayaran.

Pembayaran tidak memakai endpoint API. Aplikasi hanya menampilkan gambar QRIS statis dari `public/payment/qris-shopee.png`; kasir memverifikasi pembayaran secara manual melalui aplikasi Shopee Partner di luar sistem.

## Enam Layar

1. `SCREEN_FRAME`: memilih frame dari `public/frames/`.
2. `SCREEN_PAYMENT`: menampilkan harga Rp15.000, QRIS statis, instruksi pembayaran, status `Menunggu konfirmasi kasir`, dan tombol konfirmasi manual kasir.
3. `SCREEN_CAMERA`: meminta izin webcam, preview mirror, lalu mengambil 4 foto berurutan dengan countdown 3-2-1 untuk setiap foto.
4. `SCREEN_REVIEW`: preview satu photo strip final berisi 4 foto dan retake maksimal 2 kali untuk mengulang seluruh rangkaian.
5. `SCREEN_SUCCESS`: preview, QR Code dari URL Cloudinary, download lokal, dan countdown reset 15 menit.

`SCREEN_INPUT` tetap ada di source code untuk pengiriman email nanti, tetapi dilewati saat `VITE_ENABLE_EMAIL_DELIVERY=false`.

## Pembayaran

Harga satu sesi foto didefinisikan terpusat di `src/js/config.js`:

```js
export const PHOTO_PRICE = 15000;
```

File QRIS harus diletakkan di:

```text
public/payment/qris-shopee.png
```

Aplikasi menampilkan QRIS tersebut tanpa crop, filter, atau kompresi tambahan. Jika file belum tersedia atau gagal dimuat, layar pembayaran menampilkan placeholder `Gambar QRIS belum tersedia` dan mencatat path error di console.

Pembayaran diverifikasi manual oleh kasir:

- User scan QRIS dan membayar Rp15.000.
- User menunjukkan bukti pembayaran kepada kasir.
- Kasir memeriksa transaksi di aplikasi Shopee Partner.
- Tombol `Pembayaran Sudah Dikonfirmasi Kasir` hanya boleh ditekan setelah kasir memastikan pembayaran diterima.
- Aplikasi menyimpan status sementara di memory state:

```js
{
  provider: "static_qris",
  amount: 15000,
  status: "manually_confirmed",
  confirmedAt: new Date().toISOString()
}
```

Aplikasi tidak terhubung ke API ShopeePay, tidak memakai Midtrans, tidak memakai Xendit, tidak memiliki polling, webhook, SDK payment, database pembayaran, input kode transaksi, atau upload bukti transfer.

## Install dan Development

```bash
npm install
npm run dev
npm run dev:vercel
npm run build
npm run preview
```

Buka URL dari Vite, biasanya `http://localhost:5173`. Project ini juga memiliki middleware dev Vite untuk endpoint `/api`, sehingga flow upload QR-only bisa diuji dengan `npm run dev`. Untuk meniru Vercel Serverless Functions lebih dekat, gunakan `npm run dev:vercel` jika Vercel CLI tersedia.

Webcam bisa diuji di `localhost` atau HTTPS.

## Capture dan Compositing

Satu sesi normal mengambil 4 foto berbeda:

1. Foto 1 masuk slot paling atas.
2. Foto 2 masuk slot kedua.
3. Foto 3 masuk slot ketiga.
4. Foto 4 masuk slot paling bawah.

Setiap capture disimpan sementara di memory sebagai `Blob` terpisah di `capturedShots`. Setelah 4 foto lengkap, Canvas membuat output sesuai ukuran asli frame terpilih, menggambar tiap foto ke slot dengan crop `cover`, lalu menggambar PNG frame satu kali di lapisan paling atas.

Retake berarti mengulang seluruh rangkaian 4 foto. Kesempatan retake maksimal 2 kali.

## QR Code

QR Code tidak pernah berisi Base64, data URL, Blob URL, localhost, atau isi binary foto. QR hanya dibuat jika backend mengembalikan URL Cloudinary valid dengan hostname `res.cloudinary.com`. Dalam `STORAGE_PROVIDER=mock`, public URL berupa data URL untuk development sehingga QR sengaja tidak dibuat.

Download lokal tetap memakai object URL dari `finalCompositeBlob`.

## Environment Variables

Salin `.env.example` menjadi `.env` untuk development lokal, lalu isi sesuai provider storage/email yang digunakan. Jangan commit `.env`.

Variable utama:

```text
STORAGE_PROVIDER=cloudinary
ENABLE_EMAIL_DELIVERY=false
VITE_ENABLE_EMAIL_DELIVERY=false
PHOTO_TTL_MINUTES=15
MAX_UPLOAD_SIZE_MB=10
```

Untuk production, isi credential Cloudinary, Resend, dan `CRON_SECRET` di dashboard Vercel.

## Deploy ke Vercel

1. Push project ke repository.
2. Import project di Vercel.
3. Isi environment variables production.
4. Upload file QRIS production ke `public/payment/qris-shopee.png`.
5. Deploy.
6. Tambahkan Vercel Cron atau scheduler eksternal untuk memanggil `GET /api/cron/cleanup` dengan header `x-cron-secret`.

## Menambahkan Frame PNG

Letakkan PNG transparan di `public/frames/`. Update daftar frame di `src/js/config.js`.

Rekomendasi ukuran frame: rasio konsisten, misalnya 1200x1800 px. Ukuran canvas hasil foto mengikuti ukuran asli frame yang dipilih.

## Integrasi Cloudinary

Struktur provider ada di `api/services/storage/`. Gunakan:

```text
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

File diberi nama unik UUID di folder `photobooth-temp/`. Aplikasi menargetkan TTL 15 menit, tetapi Cloudinary tidak dianggap otomatis menghapus file. Cleanup harus dijalankan melalui endpoint cron.

## Integrasi Resend

Service email berada di `api/services/email/resend-service.js` dan tetap dipertahankan, tetapi tidak dijalankan selama:

```text
ENABLE_EMAIL_DELIVERY=false
VITE_ENABLE_EMAIL_DELIVERY=false
```

Untuk mengaktifkan lagi nanti:

```text
RESEND_API_KEY=
EMAIL_FROM=
EMAIL_PROVIDER=resend
ENABLE_EMAIL_DELIVERY=true
VITE_ENABLE_EMAIL_DELIVERY=true
```

## Temporary Storage dan Cleanup

Foto tidak disimpan di localStorage atau database. Frontend memegang `Blob` dan object URL di memory selama sesi. Backend mengupload file sementara dan mengembalikan:

```json
{
  "publicUrl": "...",
  "publicId": "photobooth-temp/...",
  "expiresAt": "..."
}
```

Endpoint `GET /api/cron/cleanup` dilindungi `CRON_SECRET`. Karena tidak ada database, cleanup production harus mengambil daftar aset dari provider berdasarkan folder dan waktu upload, lalu menghapus aset lebih tua dari 15 menit.

## Retake

Foto pertama tidak dihitung sebagai retake. User hanya dapat menekan `Ulang Foto` sebanyak 2 kali. Setiap retake menghapus seluruh `capturedShots`, object URL preview, dan final composite, lalu mengambil ulang 4 foto dari awal. Setelah kesempatan habis, tombol retake dinonaktifkan.

## Keamanan dan Privasi

- Foto diproses di browser memakai Canvas.
- Foto tidak disimpan di `localStorage`.
- Status pembayaran hanya berada di state sementara dan hilang saat reset.
- Pembayaran diverifikasi manual oleh kasir di luar aplikasi.
- API secret hanya berada di backend.
- Upload divalidasi MIME type dan ukuran maksimal.
- Nama/email hanya divalidasi ketika fitur email diaktifkan kembali.
- Endpoint photo/storage/cron memakai `Cache-Control: no-store`.
- Cleanup dilindungi constant-time secret comparison.
- Security headers dasar disiapkan di `vercel.json`.

## Known Limitations

- File `public/payment/qris-shopee.png` harus disediakan manual.
- Mock storage memakai memory proses, sehingga hilang saat server restart.
- Cloudinary cleanup perlu implementasi listing Admin API sesuai konfigurasi akun.
- Pengujian webcam membutuhkan browser di `localhost` atau HTTPS.

## Production Readiness Checklist

- Pastikan file QRIS production sudah benar dan mudah dipindai.
- Isi semua environment variables production untuk storage/cleanup.
- Uji Resend sender/domain sebelum mengaktifkan kembali email.
- Aktifkan Cloudinary provider.
- Implementasikan listing cleanup Cloudinary dan scheduler.
- Uji batas ukuran upload dan layout preview photo strip.
- Uji service worker cache setelah deploy.
- Pastikan kiosk browser memberi izin kamera.
- Pastikan SOP kasir jelas sebelum tombol konfirmasi pembayaran digunakan.
