<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Category;
use App\Models\Budget;
use App\Models\Notification;
use App\Models\UserSetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class TransactionController extends Controller
{
    /**
     * Display a listing of the transactions.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $transactions = Transaction::with('category')
            ->where('user_id', 1)
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
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
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
            'user_id' => 1,
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
            'user_id' => 1,
            'category_id' => $category->id,
            'amount' => $amount,
            'transaction_date' => $date,
            'description' => $request->description,
        ]);

        // 4. Budget checks and warning alerts
        $this->checkBudgetsAndGenerateAlerts($date);

        return response()->json([
            'success' => true,
            'transaction' => [
                'id' => $transaction->id,
                'date' => Carbon::parse($transaction->transaction_date)->format('d/m/Y'),
                'category' => $category->name,
                'description' => $transaction->description,
                'amount' => $request->type === 'Pengeluaran' ? -$amount : $amount,
                'type' => $request->type,
            ]
        ], 210); // Laravel standard resource created is 201, using 201
    }

    /**
     * Update the specified transaction in storage.
     *
     * @param  Request  $request
     * @param  int  $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'date' => 'required|string',
            'category' => 'required|string',
            'description' => 'required|string',
            'amount' => 'required|numeric',
            'type' => 'required|string|in:Pemasukan,Pengeluaran',
        ]);

        $transaction = Transaction::where('user_id', 1)->findOrFail($id);

        // 1. Get or create category
        $categoryType = strtolower($request->type);
        $category = Category::firstOrCreate([
            'user_id' => 1,
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
        $this->checkBudgetsAndGenerateAlerts($date);

        return response()->json([
            'success' => true,
            'transaction' => [
                'id' => $transaction->id,
                'date' => Carbon::parse($transaction->transaction_date)->format('d/m/Y'),
                'category' => $category->name,
                'description' => $transaction->description,
                'amount' => $request->type === 'Pengeluaran' ? -$amount : $amount,
                'type' => $request->type,
            ]
        ]);
    }

    /**
     * Remove the specified transaction from storage.
     *
     * @param  int  $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $transaction = Transaction::where('user_id', 1)->findOrFail($id);
        $transaction->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Internal function to check budget limits and generate warning notifications.
     *
     * @param string $date
     * @return void
     */
    private function checkBudgetsAndGenerateAlerts(string $date): void
    {
        $settings = UserSetting::firstOrCreate(['user_id' => 1]);
        if (!$settings->budget_alert_enabled) {
            return;
        }

        $carbonDate = Carbon::parse($date);

        // Check daily budget
        $dailyBudget = Budget::where('user_id', 1)
            ->where('period', 'harian')
            ->first();

        if ($dailyBudget && $dailyBudget->amount > 0) {
            // Sum of all daily expenses on this day
            $dailyExpense = Transaction::where('user_id', 1)
                ->where('transaction_date', $date)
                ->whereHas('category', function ($q) {
                    $q->where('type', 'pengeluaran');
                })
                ->sum('amount');

            $percent = ($dailyExpense / $dailyBudget->amount) * 100;

            if ($percent >= 100) {
                $message = "Budget Harian sudah melebihi batas (100% terpakai pada " . $carbonDate->format('d/m/Y') . ")";
                // Check duplicate today
                $exists = Notification::where('user_id', 1)
                    ->where('message', 'like', 'Budget Harian sudah melebihi batas%')
                    ->whereDate('created_at', Carbon::today())
                    ->exists();

                if (!$exists) {
                    Notification::create([
                        'user_id' => 1,
                        'title' => 'Peringatan Budget',
                        'message' => $message,
                        'type' => 'alert',
                    ]);
                }
            } elseif ($percent >= 80) {
                $message = "Budget Harian hampir habis (" . number_format($percent, 0) . "% terpakai pada " . $carbonDate->format('d/m/Y') . ")";
                $exists = Notification::where('user_id', 1)
                    ->where('message', 'like', 'Budget Harian hampir habis%')
                    ->whereDate('created_at', Carbon::today())
                    ->exists();

                if (!$exists) {
                    Notification::create([
                        'user_id' => 1,
                        'title' => 'Peringatan Budget',
                        'message' => $message,
                        'type' => 'alert',
                    ]);
                }
            }
        }
    }
}
