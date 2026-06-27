<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

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

// Public auth routes (no token required)
Route::prefix('api')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password/send', [AuthController::class, 'sendOtp']);
    Route::post('/forgot-password/verify', [AuthController::class, 'verifyOtp']);
    Route::post('/forgot-password/reset', [AuthController::class, 'resetPassword']);
});

// Protected API routes — require valid Sanctum token
Route::prefix('api')->middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/profile', [AuthController::class, 'updateProfile']);
    Route::get('/user/profile', [ProfileController::class, 'show']);
    Route::put('/user/profile', [ProfileController::class, 'update']);
    Route::post('/user/profile/photo', [ProfileController::class, 'updatePhoto']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

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
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
    Route::post('/notifications/{id}/mark-read', [NotificationController::class, 'markRead']);

    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    Route::get('/export/pdf', [ExportController::class, 'exportPdf']);
    Route::get('/export/excel', [ExportController::class, 'exportExcel']);
});
