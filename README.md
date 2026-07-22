# Photobooth Zidan

Photobooth Zidan adalah aplikasi **Progressive Web App (PWA)** berbasis Vanilla HTML, CSS, dan JavaScript ES Modules yang dirancang untuk penggunaan photobooth mandiri atau kiosk.

Dalam satu sesi, pengguna dapat:

1. Memilih desain frame.
2. Membayar melalui QRIS statis sebesar Rp15.000.
3. Meminta kasir mengonfirmasi pembayaran.
4. Mengambil empat foto menggunakan webcam.
5. Mengulang sesi foto maksimal dua kali.
6. Mendapatkan satu photo strip.
7. Mengunduh hasil melalui QR Code atau tombol download.

Aplikasi tidak menggunakan database permanen untuk menyimpan data pengguna, pembayaran, atau foto.

---

## Fitur Utama

- PWA yang dapat dipasang pada perangkat.
- Tampilan SPA tanpa perpindahan halaman.
- Pemilihan frame PNG transparan.
- Pembayaran QRIS statis.
- Konfirmasi pembayaran manual oleh kasir.
- Empat kali pengambilan foto dalam satu sesi.
- Countdown sebelum setiap pengambilan foto.
- Preview kamera dengan efek mirror.
- Compositing foto menggunakan HTML5 Canvas.
- Retake seluruh sesi maksimal dua kali.
- Upload sementara ke Cloudinary.
- QR Code untuk membuka hasil foto.
- Download photo strip.
- Reset aplikasi otomatis setelah 15 menit.
- Tidak menggunakan database permanen.
- Responsif untuk desktop, tablet, dan mode kiosk.

---

## Alur Aplikasi

### 1. Pilih Frame

Pengguna memilih desain frame dari folder:

```text
public/frames/
```

### 2. Pembayaran

Aplikasi menampilkan:

- Harga sesi sebesar Rp15.000.
- Gambar QRIS statis.
- Instruksi pembayaran.
- Tombol konfirmasi kasir.

Pembayaran diperiksa secara manual oleh kasir melalui aplikasi Shopee Partner.

### 3. Ambil Foto

Aplikasi mengambil empat foto secara berurutan:

```text
Foto 1 → slot paling atas
Foto 2 → slot kedua
Foto 3 → slot ketiga
Foto 4 → slot paling bawah
```

Setiap pengambilan foto menggunakan countdown:

```text
3 → 2 → 1
```

### 4. Review

Pengguna dapat:

- Melanjutkan menggunakan hasil foto.
- Mengulang seluruh rangkaian empat foto.

Kesempatan retake maksimal dua kali.

### 5. Hasil

Aplikasi akan:

- Mengupload photo strip ke Cloudinary.
- Membuat QR Code dari URL hasil upload.
- Menampilkan preview photo strip.
- Menyediakan tombol download.
- Mereset sesi otomatis setelah 15 menit.

---

## Tech Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- JavaScript ES Modules
- HTML5 Canvas
- MediaDevices API
- Web App Manifest
- Service Worker
- Vite

### Backend

- Vercel Serverless Functions
- Cloudinary
- Node.js

---

## Instalasi

Clone repository:

```bash
git clone <repository-url>
cd photobooth-zidan
```

Install dependency:

```bash
npm install
```

Jalankan development server:

```bash
npm run dev
```

Buka URL yang muncul di terminal, biasanya:

```text
http://localhost:5173
```

Webcam dapat digunakan melalui `localhost` atau koneksi HTTPS.

---

## Perintah Project

```bash
npm run dev
```

Menjalankan development server.

```bash
npm run build
```

Membuat production build.

```bash
npm run preview
```

Menampilkan hasil production build secara lokal.

Jika Vercel CLI sudah dikonfigurasi:

```bash
npm run dev:vercel
```

Menjalankan project dengan lingkungan yang menyerupai Vercel Serverless Functions.

---

## Environment Variables

Salin file:

```text
.env.example
```

menjadi:

```text
.env
```

Isi konfigurasi berikut:

```env
STORAGE_PROVIDER=cloudinary

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

PHOTO_TTL_MINUTES=15
MAX_UPLOAD_SIZE_MB=10

CRON_SECRET=

ENABLE_EMAIL_DELIVERY=false
VITE_ENABLE_EMAIL_DELIVERY=false
```

File `.env` berisi credential rahasia dan tidak boleh dimasukkan ke GitHub.

Pastikan `.gitignore` memiliki:

```gitignore
.env
.env.local
.env.*.local
```

---

## Konfigurasi QRIS

Masukkan gambar QRIS ke:

```text
public/payment/qris-shopee.png
```

Harga satu sesi diatur secara terpusat pada:

```text
src/js/config.js
```

```js
export const PHOTO_PRICE = 15000;
```

Aplikasi tidak terhubung langsung dengan API ShopeePay, Midtrans, atau Xendit.

Konfirmasi pembayaran dilakukan secara manual oleh kasir.

---

## Menambahkan Frame

Masukkan file frame PNG transparan ke:

```text
public/frames/
```

Kemudian daftarkan frame tersebut pada konfigurasi frame di:

```text
src/js/config.js
```

Setiap frame harus memiliki konfigurasi area penempatan foto karena posisi slot dapat berbeda pada setiap desain.

Contoh:

```js
{
  id: "frame-01",
  name: "Frame 01",
  source: "/frames/frame-01.png",
  slots: [
    { x: 100, y: 100, width: 480, height: 380 },
    { x: 100, y: 500, width: 480, height: 380 },
    { x: 100, y: 900, width: 480, height: 380 },
    { x: 100, y: 1300, width: 480, height: 380 }
  ]
}
```

Ukuran canvas hasil akhir mengikuti resolusi asli frame yang dipilih.

---

## Proses Photo Strip

Setiap foto disimpan sementara sebagai `Blob` di memory browser.

Setelah empat foto selesai:

1. Canvas dibuat berdasarkan ukuran asli frame.
2. Setiap foto digambar ke slot masing-masing.
3. Foto menggunakan metode crop `cover`.
4. PNG frame digambar sebagai lapisan paling atas.
5. Canvas dikonversi menjadi photo strip final.

Foto mentah dan hasil sementara tidak disimpan di `localStorage`.

---

## Cloudinary

Cloudinary digunakan untuk menyimpan hasil photo strip sementara.

Konfigurasi:

```env
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

File diupload menggunakan nama unik ke folder:

```text
photobooth-temp/
```

QR Code hanya dibuat dari URL publik Cloudinary seperti:

```text
https://res.cloudinary.com/...
```

QR Code tidak menggunakan:

- Base64
- Data URL
- Blob URL
- localhost
- Isi binary foto

---

## Temporary Storage

Target masa aktif foto adalah 15 menit.

Frontend menampilkan countdown selama 15 menit pada layar hasil. Setelah waktu habis, aplikasi akan:

- Menghapus state sesi.
- Menghapus object URL lokal.
- Menghapus hasil foto dari memory browser.
- Menghentikan timer yang masih aktif.
- Kembali ke halaman pemilihan frame.

Reset aplikasi tidak otomatis menjamin file Cloudinary sudah terhapus. Penghapusan file Cloudinary ditangani melalui endpoint cleanup terpisah.

---

## Cleanup

Endpoint cleanup:

```text
GET /api/cron/cleanup
```

Endpoint dilindungi menggunakan:

```env
CRON_SECRET=
```

Pada production, endpoint dapat dipanggil menggunakan Vercel Cron atau scheduler lain untuk menghapus file sementara yang sudah melewati batas waktu.

Jangan menambahkan `CRON_SECRET` asli ke repository.

---

## Fitur Email

Integrasi email tersedia sebagai fitur opsional, tetapi saat ini dinonaktifkan.

```env
ENABLE_EMAIL_DELIVERY=false
VITE_ENABLE_EMAIL_DELIVERY=false
```

Saat fitur email dinonaktifkan:

- Form nama dan email tidak ditampilkan.
- Backend tidak mengirim email.
- Tidak ada notifikasi email pada layar hasil.
- Pengguna menerima foto melalui QR Code dan tombol download.

---

## Deploy ke Vercel

1. Push project ke repository GitHub.
2. Import repository ke Vercel.
3. Isi environment variables melalui dashboard Vercel.
4. Pastikan gambar QRIS production sudah tersedia.
5. Pastikan frame dapat dimuat dengan benar.
6. Deploy project.
7. Uji kamera melalui koneksi HTTPS.
8. Konfigurasikan scheduler cleanup jika diperlukan.

Credential tidak boleh ditulis langsung di source code atau repository.

---

## Struktur Folder Utama

```text
photobooth-zidan/
├── api/
│   ├── photo/
│   ├── storage/
│   ├── cron/
│   └── services/
├── public/
│   ├── frames/
│   ├── payment/
│   ├── icons/
│   ├── manifest.webmanifest
│   └── sw.js
├── src/
│   ├── css/
│   └── js/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

---

## Keamanan dan Privasi

- Tidak menggunakan database permanen.
- Foto mentah hanya disimpan sementara di memory browser.
- Foto tidak disimpan di `localStorage`.
- API secret hanya digunakan di backend.
- Upload divalidasi berdasarkan MIME type dan ukuran file.
- Status pembayaran hanya disimpan selama sesi berlangsung.
- File `.env` tidak boleh di-push ke repository.
- Endpoint cleanup dilindungi menggunakan secret.
- Response API sensitif menggunakan `Cache-Control: no-store`.

---

## Known Limitations

- Pembayaran belum diverifikasi secara otomatis melalui API.
- Verifikasi pembayaran memerlukan kasir.
- File QRIS harus dimasukkan secara manual.
- Setiap frame membutuhkan konfigurasi slot foto.
- Cleanup Cloudinary memerlukan scheduler production.
- Webcam membutuhkan `localhost` atau HTTPS.
- Fitur email masih dinonaktifkan.
- Masa aktif URL Cloudinary bergantung pada proses cleanup backend.

---

## Production Checklist

Sebelum digunakan pada kiosk production:

- [ ] Pastikan QRIS dapat dipindai.
- [ ] Pastikan harga yang ditampilkan sudah benar.
- [ ] Pastikan semua frame memiliki konfigurasi slot.
- [ ] Pastikan credential Cloudinary aktif.
- [ ] Pastikan hasil upload menghasilkan URL HTTPS.
- [ ] Pastikan QR Code dapat dibuka dari perangkat lain.
- [ ] Pastikan countdown berjalan tepat 15 menit.
- [ ] Pastikan aplikasi tidak reset sebelum waktunya.
- [ ] Pastikan tombol selesai mereset seluruh sesi.
- [ ] Pastikan kamera memiliki izin permanen pada perangkat kiosk.
- [ ] Pastikan service worker tidak menyajikan cache lama.
- [ ] Pastikan cleanup Cloudinary berjalan.
- [ ] Pastikan `.env` tidak masuk ke GitHub.
- [ ] Pastikan kasir memahami prosedur konfirmasi pembayaran.

---

## Status Project

Versi saat ini menggunakan alur:

```text
Pilih Frame
→ Bayar QRIS
→ Konfirmasi Kasir
→ Ambil 4 Foto
→ Review
→ Upload Cloudinary
→ QR Code
→ Download
→ Reset 15 Menit
```

Fitur email masih tersedia di source code, tetapi sedang dinonaktifkan.
