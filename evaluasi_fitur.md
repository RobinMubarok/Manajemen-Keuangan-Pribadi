# 📊 Evaluasi Fitur — Manajemen Keuangan Pribadi
> Dievaluasi pada: 20 Juni 2026 | Stack: Laravel 13 + React (SPA)

---

## ✅ Fitur yang Sudah Jalan (Siap Pakai)

| Fitur | Lokasi | Status |
|-------|--------|--------|
| Tampilan halaman Transaksi (tabel, search, filter, sort) | `TransaksiPage.jsx` | ✅ Jalan |
| Tambah transaksi (form + validasi + kirim ke API) | `TambahTransaksiPage.jsx` | ✅ Jalan |
| Edit transaksi (pre-fill form + kirim PUT) | `TambahTransaksiPage.jsx` | ✅ Jalan |
| Hapus transaksi (modal konfirmasi + DELETE API) | `TransaksiPage.jsx` | ✅ Jalan |
| API CRUD Transaksi (index, store, update, destroy) | `TransactionController.php` | ✅ Jalan |
| API Kategori (index, store, destroy) | `CategoryController.php` | ✅ Jalan |
| Kelola Kategori via modal (tambah + hapus) | `KelolaCategoryModal.jsx` | ✅ Jalan |
| API Budget (GET + POST/save) | `BudgetController.php` | ✅ Jalan |
| API Notifikasi (index, mark-read, mark-all-read) | `NotificationController.php` | ✅ Jalan |
| Halaman Notifikasi (tampil notif, tandai dibaca) | `NotifikasiPage.jsx` | ✅ Jalan |
| Export CSV laporan | `LaporanPage.jsx` | ✅ Jalan |
| Export PDF laporan (`html2pdf.js`) | `LaporanPage.jsx` | ✅ Jalan |
| Halaman Laporan (filter bulan/tahun + tabel dinamis dari API) | `LaporanPage.jsx` | ✅ Jalan |
| Budget alert otomatis saat tambah/edit transaksi | `TransactionController.php` | ✅ Jalan |
| Halaman Atur Budget (form + save ke API) | `AturBudgetPage.jsx` | ✅ Jalan |

---

## 🔴 Masalah Kritis — Harus Diperbaiki Sebelum Deploy

### 1. Autentikasi adalah PALSU (Bypass Total)
**File:** [`AuthPage.jsx`](file:///c:/Users/Haydar%20Ali/Herd/Manajemen-Keuangan-Pribadi/resources/js/pages/AuthPage.jsx) (baris 11–17)

```js
const handleSubmit = (e) => {
    e.preventDefault();
    // Simulasi login sukses, tidak peduli apa username/password yang dimasukkan
    if (onLogin) {
        onLogin('dashboard'); // ← SEMUA ORANG BISA LOGIN!
    }
};
```

**Dampak:** Siapapun bisa masuk tanpa password. Tidak ada sesi/token, tidak ada proteksi route API. **Ini adalah blocker utama untuk deploy.**

Tidak ada:
- Endpoint `/api/login`, `/api/register`, `/api/logout`
- Laravel Sanctum / session authentication
- Middleware `auth` pada route API
- Proteksi agar data hanya bisa diakses oleh user yang login

---

### 2. Semua Data Hardcode ke `user_id = 1`
**File:** Semua controller — `TransactionController`, `BudgetController`, `CategoryController`, `NotificationController`

```php
// Contoh dari TransactionController.php baris 24, 64, 78...
->where('user_id', 1)
```

**Dampak:** Semua pengguna berbagi data yang sama. Sistem tidak bisa digunakan oleh lebih dari 1 akun.

---

### 3. Dashboard Masih Pakai Data Statis (Tidak Terhubung ke Database)
**File:** [`DashboardPage.jsx`](file:///c:/Users/Haydar%20Ali/Herd/Manajemen-Keuangan-Pribadi/resources/js/pages/DashboardPage.jsx)

Data yang **hardcode** (bukan dari API):
- **Ringkasan Pemasukan/Pengeluaran** → `"Rp 17.600.000"` dan `"Rp 5.800.000"` (nilai statis, tidak dihitung dari transaksi real)
- **BudgetProgress** → `used={30000} total={75000}` (statis)
- **SpendingDonutChart** → Array `SPENDING_DATA` statis (tidak dari transaksi user)
- **TransactionList** → Array `TRANSACTIONS` statis (bukan dari state global)

**Dampak:** Dashboard tidak mencerminkan data user yang sebenarnya sama sekali.

---

### 4. `TambahTransaksiPage` Menggunakan Kategori Hardcode, Bukan dari Database
**File:** [`TambahTransaksiPage.jsx`](file:///c:/Users/Haydar%20Ali/Herd/Manajemen-Keuangan-Pribadi/resources/js/pages/TambahTransaksiPage.jsx) (baris 9–12)

```js
const CATEGORIES = {
    Pemasukan: ['Gaji', 'Beasiswa', 'Bonus', 'Hasil Usaha', 'Investasi', 'Lainnya'],
    Pengeluaran: ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya'],
};
```

**Dampak:** Kategori kustom yang dibuat user via "Kelola Kategori" tidak muncul di form Tambah/Edit Transaksi. Kategori yang dikelola terpisah dari yang dipakai.

---

### 5. Response API `store` Transaksi Salah Format
**File:** [`TransactionController.php`](file:///c:/Users/Haydar%20Ali/Herd/Manajemen-Keuangan-Pribadi/app/Http/Controllers/TransactionController.php) (baris 88–98)

```php
return response()->json([
    'success' => true,
    'transaction' => [...] // ← terbungkus dalam key 'transaction'
], 210); // ← 210 bukan HTTP status yang valid (harusnya 201)
```

Di frontend, `App.jsx` baris 103 melakukan:
```js
.then((newTx) => setTransactions((prev) => [newTx, ...prev]))
```

Frontend mengharapkan objek transaksi langsung, tapi API mengembalikan `{ success: true, transaction: {...} }`. Akibatnya transaksi baru yang ditambah **tidak langsung muncul di list** tanpa refresh.

---

### 6. `AturBudgetPage` Tidak Fetch Data Saat Dibuka (State Selalu Kosong)
**File:** [`AturBudgetPage.jsx`](file:///c:/Users/Haydar%20Ali/Herd/Manajemen-Keuangan-Pribadi/resources/js/pages/AturBudgetPage.jsx) (baris 19–25)

```js
const [harianBudget, setHarianBudget] = useState(budgetData?.harian || '');
```

Di `App.jsx` baris 219:
```js
case 'atur-budget':
    return <AturBudgetPage onNavigate={setCurrentPage} />; // ← budgetData tidak dikirim!
```

**Dampak:** Form budget selalu kosong ketika dibuka, meskipun user sudah pernah menyimpan budget sebelumnya. Budget yang sudah disimpan tidak ditampilkan kembali. Prop `onSave` juga tidak dikirim dari `App.jsx`.

---

### 7. Budget Hanya Cek Harian (Bulanan Tidak Dicek)
**File:** [`TransactionController.php`](file:///c:/Users/Haydar%20Ali/Herd/Manajemen-Keuangan-Pribadi/app/Http/Controllers/TransactionController.php) (baris 180–238)

Fungsi `checkBudgetsAndGenerateAlerts()` hanya mengecek **budget harian**. Budget bulanan yang sudah disimpan tidak pernah dicek dan tidak pernah menghasilkan notifikasi.

---

### 8. Pengingat Harian (Daily Reminder) Tidak Ada Implementasinya
**File:** Tidak ditemukan

Di `NotifikasiPage.jsx` baris 179 disebutkan:
> *"Pengingat Harian: Setiap hari pukul 20.00..."*

Dan di `BudgetController.php` ada field `daily_reminder_enabled`. Namun tidak ada:
- Laravel Scheduled Task (`app/Console/Kernel.php` atau `routes/console.php`)
- Job / Command yang mengirim notifikasi pengingat
- Tidak ada `artisan` command untuk ini

---

## 🟡 Masalah Medium — Penting untuk Kualitas

### 9. `style jsx` di AuthPage Tidak Didukung React Biasa
**File:** [`AuthPage.jsx`](file:///c:/Users/Haydar%20Ali/Herd/Manajemen-Keuangan-Pribadi/resources/js/pages/AuthPage.jsx) (baris 176)

```jsx
<style jsx>{` ... `}</style>
```

Sintaks `jsx` pada `<style>` adalah fitur Next.js / Styled JSX, **bukan React standar**. Ini akan menyebabkan warning/error di console dan animasi `fadeIn` mungkin tidak berfungsi.

---

### 10. Navigasi Tidak Memiliki URL / History Browser
**File:** [`app.jsx`](file:///c:/Users/Haydar%20Ali/Herd/Manajemen-Keuangan-Pribadi/resources/js/app.jsx)

Sistem menggunakan state `currentPage` sebagai router, bukan React Router. Akibatnya:
- Tombol **Back/Forward** browser tidak berfungsi
- URL selalu tetap di `/` tidak peduli halaman mana yang dibuka
- Tidak bisa share link ke halaman tertentu (misal: `/transaksi`)
- Refresh browser selalu kembali ke halaman login

---

### 11. Status HTTP 210 pada `store` Transaksi
**File:** [`TransactionController.php`](file:///c:/Users/Haydar%20Ali/Herd/Manajemen-Keuangan-Pribadi/app/Http/Controllers/TransactionController.php) (baris 98)

```php
], 210); // → HTTP 210 bukan status standar. Harusnya 201
```

Komentar di kode bahkan mengakui ini salah: `// Laravel standard resource created is 201, using 201` tapi kodenya tetap `210`.

---

### 12. Tidak Ada User Seeder / Data Awal
Semua controller hardcode ke `user_id = 1`, tapi tidak ada seeder yang memastikan user dengan ID 1 ada di database. Jika database fresh/kosong, semua API akan gagal.

---

## 🟠 Fitur yang Ada di UI tapi Tidak Terhubung

| Fitur UI | Status Backend |
|----------|---------------|
| Tombol "Continue with Google" di Login | ❌ Tidak ada backend OAuth |
| "Forgot Password?" link | ❌ Hanya `href="#"`, tidak ada implementasi |
| Form Register (nama, email, password, confirm) | ❌ Tidak ada endpoint `/api/register`, login langsung bypass |
| Dropdown "Kategori Budget" (Harian/Mingguan/Bulanan) di Atur Budget | ⚠️ Nilai `Mingguan` tersimpan tapi tidak ada logika di backend |
| `alertHampirHabis` dan `alertMelebihi` sebagai toggle terpisah | ⚠️ Backend menyatukan keduanya jadi satu field `budget_alert_enabled` |

---

## 📋 Ringkasan Prioritas Sebelum Deploy

### 🔴 WAJIB DIPERBAIKI (Blocker)
1. **Implementasi autentikasi nyata** — Laravel Sanctum + endpoint login/register/logout + middleware auth
2. **Ganti `user_id = 1`** → Gunakan `auth()->id()` di semua controller
3. **Perbaiki response format `store` transaksi** — Kembalikan objek langsung, bukan `{success, transaction}` + fix HTTP 201
4. **Hubungkan Dashboard ke data real** — Fetch pemasukan, pengeluaran, budget, dan transaksi terbaru dari API
5. **Beri `budgetData` & `onSave` ke `AturBudgetPage`** — Fetch dari `/api/budget` saat komponen mount, simpan kembali lewat prop

### 🟡 SANGAT DISARANKAN
6. **TambahTransaksiPage ambil kategori dari state global** — Gunakan `categories` prop yang sudah ada di `App.jsx`
7. **Tambahkan cek budget bulanan** di `checkBudgetsAndGenerateAlerts`
8. **Buat user seeder** untuk user default
9. **Ganti `<style jsx>`** dengan CSS biasa atau `<style>` reguler

### 🟠 NICE-TO-HAVE
10. Implementasi daily reminder via Laravel Scheduler
11. Tambahkan React Router untuk navigasi berbasis URL
12. Pisahkan `alertHampirHabis` dan `alertMelebihi` di backend

