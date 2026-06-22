<?php

namespace Database\Seeders;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Notification;
use App\Models\Transaction;
use App\Models\User;
use App\Models\UserSetting;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed User
        $user = User::updateOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'User',
                'password' => Hash::make('password'),
            ]
        );

        // 2. Seed User Settings
        UserSetting::updateOrCreate(
            ['user_id' => $user->id],
            [
                'daily_reminder_enabled' => true,
                'budget_alert_enabled' => true,
            ]
        );

        // 3. Seed Categories
        $categoriesData = [
            // Pemasukan
            ['name' => 'Gaji', 'type' => 'pemasukan'],
            ['name' => 'Beasiswa', 'type' => 'pemasukan'],
            ['name' => 'Bonus', 'type' => 'pemasukan'],
            ['name' => 'Hasil Usaha', 'type' => 'pemasukan'],
            ['name' => 'Investasi', 'type' => 'pemasukan'],
            ['name' => 'Lainnya', 'type' => 'pemasukan'],
            // Pengeluaran
            ['name' => 'Makanan', 'type' => 'pengeluaran'],
            ['name' => 'Transportasi', 'type' => 'pengeluaran'],
            ['name' => 'Belanja', 'type' => 'pengeluaran'],
            ['name' => 'Tagihan', 'type' => 'pengeluaran'],
            ['name' => 'Hiburan', 'type' => 'pengeluaran'],
            ['name' => 'Kesehatan', 'type' => 'pengeluaran'],
            ['name' => 'Lainnya', 'type' => 'pengeluaran'],
        ];

        $categories = [];
        foreach ($categoriesData as $cat) {
            $categories[$cat['name'].'_'.$cat['type']] = Category::updateOrCreate(
                ['user_id' => $user->id, 'name' => $cat['name'], 'type' => $cat['type']]
            );
        }

        // 4. Seed Budgets
        Budget::updateOrCreate(
            ['user_id' => $user->id, 'period' => 'harian', 'category_id' => null],
            ['amount' => 75000]
        );

        Budget::updateOrCreate(
            ['user_id' => $user->id, 'period' => 'bulanan', 'category_id' => null],
            ['amount' => 3000000]
        );

        // 5. Seed Transactions
        $transactionsData = [
            // Mei 2026
            [
                'category_name' => 'Hiburan',
                'category_type' => 'pengeluaran',
                'amount' => 350000,
                'date' => '2026-05-19',
                'description' => 'Langganan Streaming',
            ],
            [
                'category_name' => 'Beasiswa',
                'category_type' => 'pemasukan',
                'amount' => 5800000,
                'date' => '2026-05-18',
                'description' => 'Beasiswa Indonesia Jaya',
            ],
            [
                'category_name' => 'Makanan',
                'category_type' => 'pengeluaran',
                'amount' => 50000,
                'date' => '2026-05-17',
                'description' => 'Kopi & Snack',
            ],
            [
                'category_name' => 'Belanja',
                'category_type' => 'pengeluaran',
                'amount' => 750000,
                'date' => '2026-05-17',
                'description' => 'Beli Baju',
            ],
            [
                'category_name' => 'Transportasi',
                'category_type' => 'pengeluaran',
                'amount' => 50000,
                'date' => '2026-05-16',
                'description' => 'Grab ke kampus',
            ],
            [
                'category_name' => 'Makanan',
                'category_type' => 'pengeluaran',
                'amount' => 50000,
                'date' => '2026-05-15',
                'description' => 'DO Gacoan',
            ],
            [
                'category_name' => 'Kesehatan',
                'category_type' => 'pengeluaran',
                'amount' => 200000,
                'date' => '2026-05-14',
                'description' => 'Vitamin C',
            ],
            // April 2026
            [
                'category_name' => 'Gaji',
                'category_type' => 'pemasukan',
                'amount' => 12000000,
                'date' => '2026-04-10',
                'description' => 'Gaji Bulanan Utama',
            ],
            [
                'category_name' => 'Makanan',
                'category_type' => 'pengeluaran',
                'amount' => 450000,
                'date' => '2026-04-12',
                'description' => 'Makan Malam Mewah',
            ],
            [
                'category_name' => 'Belanja',
                'category_type' => 'pengeluaran',
                'amount' => 800000,
                'date' => '2026-04-18',
                'description' => 'Beli Sepatu Baru',
            ],
            // Juni 2026
            [
                'category_name' => 'Hasil Usaha',
                'category_type' => 'pemasukan',
                'amount' => 4500000,
                'date' => '2026-06-02',
                'description' => 'Penjualan Toko Online',
            ],
            [
                'category_name' => 'Transportasi',
                'category_type' => 'pengeluaran',
                'amount' => 350000,
                'date' => '2026-06-05',
                'description' => 'Servis Motor Rutin',
            ],
        ];

        foreach ($transactionsData as $tx) {
            $catKey = $tx['category_name'].'_'.$tx['category_type'];
            $category = $categories[$catKey] ?? null;

            if ($category) {
                // Ensure exact dates and details using updateOrCreate
                Transaction::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'category_id' => $category->id,
                        'transaction_date' => $tx['date'],
                        'description' => $tx['description'],
                    ],
                    [
                        'amount' => $tx['amount'],
                    ]
                );
            }
        }

        // 6. Seed Notifications
        $notificationsData = [
            [
                'title' => 'Peringatan Budget',
                'message' => 'Budget Makanan hampir habis (85% terpakai)',
                'type' => 'alert',
                'is_read' => false,
                'created_at' => Carbon::now()->subHours(23),
            ],
            [
                'title' => 'Pengingat Harian',
                'message' => 'Jangan lupa catat pengeluaran hari ini',
                'type' => 'reminder',
                'is_read' => false,
                'created_at' => Carbon::now()->subDay(),
            ],
            [
                'title' => 'Transaksi Berhasil',
                'message' => 'Transaksi berhasil disimpan: Langganan streaming',
                'type' => 'system',
                'is_read' => true,
                'created_at' => Carbon::now()->subDay(),
            ],
            [
                'title' => 'Peringatan Budget',
                'message' => 'Budget Transportasi hampir habis (80% terpakai)',
                'type' => 'alert',
                'is_read' => true,
                'created_at' => Carbon::now()->subDays(3),
            ],
        ];

        foreach ($notificationsData as $notif) {
            Notification::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'message' => $notif['message'],
                ],
                [
                    'title' => $notif['title'],
                    'type' => $notif['type'],
                    'is_read' => $notif['is_read'],
                    'created_at' => $notif['created_at'],
                ]
            );
        }
    }
}
