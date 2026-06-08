<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\NotificationController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| Route root mengarah ke aplikasi React Money Manager.
| Semua navigasi halaman (Dashboard, Transaksi, dll.) ditangani
| oleh React di sisi frontend — tidak perlu menambah route baru
| untuk setiap halaman baru.
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return view('money-manager');
});

Route::get('/welcome', function () {
    return view('welcome');
});

Route::prefix('api')->group(function () {
    // Transactions CRUD
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::put('/transactions/{id}', [TransactionController::class, 'update']);
    Route::delete('/transactions/{id}', [TransactionController::class, 'destroy']);

    // Budget & Settings
    Route::get('/budget', [BudgetController::class, 'index']);
    Route::post('/budget', [BudgetController::class, 'store']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
    Route::post('/notifications/{id}/mark-read', [NotificationController::class, 'markRead']);
});
