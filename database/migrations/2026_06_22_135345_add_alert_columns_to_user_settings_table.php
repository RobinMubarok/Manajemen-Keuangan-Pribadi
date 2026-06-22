<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tambah dua kolom terpisah untuk alert hampir habis (80%) dan
     * melebihi batas (100%), agar backend dapat membedakan keduanya.
     * Nilai default true agar user yang sudah ada tidak kehilangan alert.
     */
    public function up(): void
    {
        Schema::table('user_settings', function (Blueprint $table) {
            $table->boolean('alert_hampir_habis')->default(true)->after('budget_alert_enabled');
            $table->boolean('alert_melebihi')->default(true)->after('alert_hampir_habis');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_settings', function (Blueprint $table) {
            $table->dropColumn(['alert_hampir_habis', 'alert_melebihi']);
        });
    }
};
