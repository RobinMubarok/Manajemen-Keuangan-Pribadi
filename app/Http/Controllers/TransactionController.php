<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Notification;
use App\Models\Transaction;
use App\Models\UserSetting;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Display a listing of the transactions for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Transaction::with('category')
            ->where('user_id', auth()->id());

        // Optional month/year filter (used by LaporanPage)
        if ($request->filled('month') && $request->filled('year')) {
            $query->whereMonth('transaction_date', (int) $request->month)
                ->whereYear('transaction_date', (int) $request->year);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
            ->get()
            ->map(function (Transaction $t) {
                // Determine display type and signed amount
                $type = $t->category->type === 'pengeluaran' ? 'Pengeluaran' : 'Pemasukan';
                $amount = $t->category->type === 'pengeluaran' ? -$t->amount : $t->amount;

                return [
                    'id' => $t->id,
                    'date' => $t->transaction_date ? $t->transaction_date->format('d/m/Y') : '',
                    'category' => $t->category->name,
                    'description' => $t->description,
                    'amount' => $amount,
                    'type' => $type,
                ];
            });

        return response()->json($transactions);
    }

    /**
     * Store a newly created transaction in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $userId = auth()->id();

        $request->validate([
            'date' => 'required|string',
            'category' => 'required|string',
            'description' => 'required|string',
            'amount' => 'required|numeric',
            'type' => 'required|string|in:Pemasukan,Pengeluaran',
        ]);

        // 1. Get or create category
        $categoryType = strtolower($request->type); // 'pemasukan' or 'pengeluaran'
        $category = Category::firstOrCreate([
            'user_id' => $userId,
            'name' => $request->category,
            'type' => $categoryType,
        ]);

        // 2. Parse date
        try {
            $date = Carbon::createFromFormat('j/n/Y', $request->date)->format('Y-m-d');
        } catch (\Exception $e) {
            $date = Carbon::parse($request->date)->format('Y-m-d');
        }

        // 3. Store transaction (absolute amount in DB)
        $amount = abs($request->amount);
        $transaction = Transaction::create([
            'user_id' => $userId,
            'category_id' => $category->id,
            'amount' => $amount,
            'transaction_date' => $date,
            'description' => $request->description,
        ]);

        // 4. Budget checks and warning alerts
        $this->checkBudgetsAndGenerateAlerts($userId, $date);

        // Return the transaction object directly (not wrapped in {success, transaction})
        return response()->json([
            'id' => $transaction->id,
            'date' => Carbon::parse($transaction->transaction_date)->format('d/m/Y'),
            'category' => $category->name,
            'description' => $transaction->description,
            'amount' => $request->type === 'Pengeluaran' ? -$amount : $amount,
            'type' => $request->type,
        ], 201);
    }

    /**
     * Update the specified transaction in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $userId = auth()->id();

        $request->validate([
            'date' => 'required|string',
            'category' => 'required|string',
            'description' => 'required|string',
            'amount' => 'required|numeric',
            'type' => 'required|string|in:Pemasukan,Pengeluaran',
        ]);

        $transaction = Transaction::where('user_id', $userId)->findOrFail($id);

        // 1. Get or create category
        $categoryType = strtolower($request->type);
        $category = Category::firstOrCreate([
            'user_id' => $userId,
            'name' => $request->category,
            'type' => $categoryType,
        ]);

        // 2. Parse date
        try {
            $date = Carbon::createFromFormat('j/n/Y', $request->date)->format('Y-m-d');
        } catch (\Exception $e) {
            $date = Carbon::parse($request->date)->format('Y-m-d');
        }

        // 3. Update transaction
        $amount = abs($request->amount);
        $transaction->update([
            'category_id' => $category->id,
            'amount' => $amount,
            'transaction_date' => $date,
            'description' => $request->description,
        ]);

        // 4. Budget checks and warning alerts
        $this->checkBudgetsAndGenerateAlerts($userId, $date);

        return response()->json([
            'id' => $transaction->id,
            'date' => Carbon::parse($transaction->transaction_date)->format('d/m/Y'),
            'category' => $category->name,
            'description' => $transaction->description,
            'amount' => $request->type === 'Pengeluaran' ? -$amount : $amount,
            'type' => $request->type,
        ]);
    }

    /**
     * Remove the specified transaction from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $transaction = Transaction::where('user_id', auth()->id())->findOrFail($id);
        $transaction->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Internal function to check budget limits and generate warning notifications.
     */
    private function checkBudgetsAndGenerateAlerts(int $userId, string $date): void
    {
        $settings = UserSetting::firstOrCreate(['user_id' => $userId]);

        if (! $settings->budget_alert_enabled) {
            return;
        }

        $carbonDate = Carbon::parse($date);

        // ── Check daily budget ──────────────────────────────────────────
        $dailyBudget = Budget::where('user_id', $userId)
            ->where('period', 'harian')
            ->first();

        if ($dailyBudget && $dailyBudget->amount > 0) {
            $dailyExpense = Transaction::where('user_id', $userId)
                ->where('transaction_date', $date)
                ->whereHas('category', fn ($q) => $q->where('type', 'pengeluaran'))
                ->sum('amount');

            $percent = ($dailyExpense / $dailyBudget->amount) * 100;

            if ($percent >= 100) {
                $message = 'Budget Harian sudah melebihi batas (100% terpakai pada '.$carbonDate->format('d/m/Y').')';
                $exists = Notification::where('user_id', $userId)
                    ->where('message', 'like', 'Budget Harian sudah melebihi batas%')
                    ->whereDate('created_at', Carbon::today())
                    ->exists();

                if (! $exists) {
                    Notification::create([
                        'user_id' => $userId,
                        'title' => 'Peringatan Budget',
                        'message' => $message,
                        'type' => 'alert',
                    ]);
                }
            } elseif ($percent >= 80) {
                $message = 'Budget Harian hampir habis ('.number_format($percent, 0).'% terpakai pada '.$carbonDate->format('d/m/Y').')';
                $exists = Notification::where('user_id', $userId)
                    ->where('message', 'like', 'Budget Harian hampir habis%')
                    ->whereDate('created_at', Carbon::today())
                    ->exists();

                if (! $exists) {
                    Notification::create([
                        'user_id' => $userId,
                        'title' => 'Peringatan Budget',
                        'message' => $message,
                        'type' => 'alert',
                    ]);
                }
            }
        }

        // ── Check monthly budget ────────────────────────────────────────
        $monthlyBudget = Budget::where('user_id', $userId)
            ->where('period', 'bulanan')
            ->first();

        if ($monthlyBudget && $monthlyBudget->amount > 0) {
            $monthlyExpense = Transaction::where('user_id', $userId)
                ->whereYear('transaction_date', $carbonDate->year)
                ->whereMonth('transaction_date', $carbonDate->month)
                ->whereHas('category', fn ($q) => $q->where('type', 'pengeluaran'))
                ->sum('amount');

            $percentMonthly = ($monthlyExpense / $monthlyBudget->amount) * 100;
            $monthLabel = $carbonDate->translatedFormat('F Y');

            if ($percentMonthly >= 100) {
                $message = 'Budget Bulanan sudah melebihi batas (100% terpakai pada '.$monthLabel.')';
                $exists = Notification::where('user_id', $userId)
                    ->where('message', 'like', 'Budget Bulanan sudah melebihi batas%'.$monthLabel.'%')
                    ->exists();

                if (! $exists) {
                    Notification::create([
                        'user_id' => $userId,
                        'title' => 'Peringatan Budget Bulanan',
                        'message' => $message,
                        'type' => 'alert',
                    ]);
                }
            } elseif ($percentMonthly >= 80) {
                $message = 'Budget Bulanan hampir habis ('.number_format($percentMonthly, 0).'% terpakai pada '.$monthLabel.')';
                $exists = Notification::where('user_id', $userId)
                    ->where('message', 'like', 'Budget Bulanan hampir habis%'.$monthLabel.'%')
                    ->exists();

                if (! $exists) {
                    Notification::create([
                        'user_id' => $userId,
                        'title' => 'Peringatan Budget Bulanan',
                        'message' => $message,
                        'type' => 'alert',
                    ]);
                }
            }
        }
    }
}
