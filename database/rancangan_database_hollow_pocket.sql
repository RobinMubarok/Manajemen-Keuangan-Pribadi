-- ==============================================================================
-- RANCANGAN DATABASE HOLLOW POCKET (BCNF COMPLIANT)
-- Database Engine: MySQL / PostgreSQL (Cocok untuk Laravel)
-- ==============================================================================

-- 1. Tabel users
-- Menyimpan data pengguna aplikasi.
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabel user_settings
-- Memisahkan pengaturan user (seperti toggle notifikasi di halaman Set Budget)
-- untuk menghindari tabel users menjadi terlalu lebar dan memenuhi 1NF.
CREATE TABLE user_settings (
    user_id BIGINT UNSIGNED PRIMARY KEY,
    daily_reminder_enabled BOOLEAN DEFAULT TRUE,
    budget_alert_enabled BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tabel categories (Memenuhi BCNF)
-- Tipe (Pemasukan/Pengeluaran) disimpan di sini, BUKAN di tabel transaksi.
-- Hal ini mencegah redundansi dan memastikan BCNF (kategori_id menentukan tipe).
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('pemasukan', 'pengeluaran') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Memastikan tidak ada nama kategori yang duplikat untuk tipe yang sama per user
    UNIQUE KEY unique_user_category (user_id, name, type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Tabel budgets (Memenuhi BCNF)
-- Menangani "Harian Budget", "Bulanan Budget", dan "Budget per Kategori" (Page 5 & 6)
-- Jika category_id NULL, berarti itu adalah budget global (Harian/Bulanan).
CREATE TABLE budgets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NULL, 
    period ENUM('harian', 'bulanan', 'kategori') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Constraint agar tidak ada budget ganda untuk periode/kategori yang sama
    UNIQUE KEY unique_user_budget (user_id, category_id, period),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 5. Tabel transactions (Memenuhi BCNF)
-- Tidak ada kolom 'type' (Pemasukan/Pengeluaran) di sini karena bergantung secara 
-- fungsional pada category_id. Kita akan JOIN dengan tabel categories untuk mendapatkan tipenya.
CREATE TABLE transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 6. Tabel notifications
-- Menyimpan riwayat notifikasi (Page 8)
CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('alert', 'reminder', 'system') NOT NULL, -- Untuk ikon/warna yang berbeda di UI
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);