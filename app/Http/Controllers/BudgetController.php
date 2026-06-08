<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\UserSetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BudgetController extends Controller
{
    /**
     * Retrieve budget and settings for user 1.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $settings = UserSetting::firstOrCreate(
            ['user_id' => 1],
            [
                'daily_reminder_enabled' => true,
                'budget_alert_enabled' => true,
            ]
        );

        $harianBudget = Budget::where('user_id', 1)
            ->where('period', 'harian')
            ->first();

        $bulananBudget = Budget::where('user_id', 1)
            ->where('period', 'bulanan')
            ->first();

        return response()->json([
            'harian' => $harianBudget ? (int) $harianBudget->amount : 0,
            'bulanan' => $bulananBudget ? (int) $bulananBudget->amount : 0,
            'kategori' => 'Harian',
            'notifikasi' => $settings->daily_reminder_enabled,
            'alertHampirHabis' => $settings->budget_alert_enabled,
            'alertMelebihi' => $settings->budget_alert_enabled,
        ]);
    }

    /**
     * Save/Update budget and settings for user 1.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'harian' => 'nullable|integer',
            'bulanan' => 'nullable|integer',
            'notifikasi' => 'required|boolean',
            'alertHampirHabis' => 'required|boolean',
            'alertMelebihi' => 'required|boolean',
        ]);

        // 1. Update/create budgets
        Budget::updateOrCreate(
            ['user_id' => 1, 'period' => 'harian', 'category_id' => null],
            ['amount' => $request->input('harian', 0)]
        );

        Budget::updateOrCreate(
            ['user_id' => 1, 'period' => 'bulanan', 'category_id' => null],
            ['amount' => $request->input('bulanan', 0)]
        );

        // 2. Update settings
        $settings = UserSetting::updateOrCreate(
            ['user_id' => 1],
            [
                'daily_reminder_enabled' => $request->notifikasi,
                'budget_alert_enabled' => $request->alertHampirHabis || $request->alertMelebihi,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Budget dan pengaturan berhasil disimpan.'
        ]);
    }
}
