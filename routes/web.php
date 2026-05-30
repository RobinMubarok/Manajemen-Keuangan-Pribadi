<?php

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
