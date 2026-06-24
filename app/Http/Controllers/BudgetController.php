<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\UserSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    /**
     * Retrieve budget and settings for the authenticated user.
     */
    public function index(): JsonResponse
    {
        $userId = auth()->id();

        $settings = UserSetting::firstOrCreate(
            ['user_id' => $userId],
            [
                'daily_reminder_enabled' => true,
                'budget_alert_enabled' => true,
            ]
        );

        $harianBudget = Budget::where('user_id', $userId)
            ->where('period', 'harian')
            ->first();

        $bulananBudget = Budget::where('user_id', $userId)
            ->where('period', 'bulanan')
            ->first();

        $harianAmount = $harianBudget ? (int) $harianBudget->amount : 0;
        $bulananAmount = $bulananBudget ? (int) $bulananBudget->amount : 0;

        $kategori = 'Harian';
        if ($bulananAmount > 0 && $harianAmount == 0) {
            $kategori = 'Bulanan';
        }

        return response()->json([
            'harian' => $harianAmount,
            'bulanan' => $bulananAmount,
            'kategori' => $kategori,
            'notifikasi' => $settings->daily_reminder_enabled,
            'alertHampirHabis' => $settings->alert_hampir_habis,
            'alertMelebihi' => $settings->alert_melebihi,
        ]);
    }

    /**
     * Save/Update budget and settings for the authenticated user.
     */
    public function store(Request $request): JsonResponse
    {
        $userId = auth()->id();

        $request->validate([
            'harian' => 'nullable|integer',
            'bulanan' => 'nullable|integer',
            'kategori' => 'required|string|in:Harian,Bulanan',
            'notifikasi' => 'required|boolean',
            'alertHampirHabis' => 'required|boolean',
            'alertMelebihi' => 'required|boolean',
        ]);

        $kategori = $request->input('kategori', 'Harian');
        $harian = $kategori === 'Harian' ? $request->input('harian', 0) : 0;
        $bulanan = $kategori === 'Bulanan' ? $request->input('bulanan', 0) : 0;

        // 1. Update/create budgets
        Budget::updateOrCreate(
            ['user_id' => $userId, 'period' => 'harian', 'category_id' => null],
            ['amount' => $harian]
        );

        Budget::updateOrCreate(
            ['user_id' => $userId, 'period' => 'bulanan', 'category_id' => null],
            ['amount' => $bulanan]
        );

        // 2. Update settings — simpan masing-masing flag secara terpisah
        UserSetting::updateOrCreate(
            ['user_id' => $userId],
            [
                'daily_reminder_enabled' => $request->notifikasi,
                'budget_alert_enabled' => $request->alertHampirHabis || $request->alertMelebihi,
                'alert_hampir_habis' => $request->alertHampirHabis,
                'alert_melebihi' => $request->alertMelebihi,
            ]
        );

        // Return updated budget data so frontend can update state immediately
        return response()->json([
            'harian' => (int) $harian,
            'bulanan' => (int) $bulanan,
            'kategori' => $kategori,
            'notifikasi' => $request->notifikasi,
            'alertHampirHabis' => $request->alertHampirHabis,
            'alertMelebihi' => $request->alertMelebihi,
        ]);
    }
}
