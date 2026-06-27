<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $userId = auth()->id();
        $now = Carbon::now();

        // ── Monthly income & expense (current month) ────────────────────
        $monthlyTotals = DB::table('transactions')
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $userId)
            ->whereYear('transactions.transaction_date', $now->year)
            ->whereMonth('transactions.transaction_date', $now->month)
            ->selectRaw('categories.type, SUM(transactions.amount) as total')
            ->groupBy('categories.type')
            ->pluck('total', 'type');

        $monthlyIncome = $monthlyTotals['pemasukan'] ?? 0;
        $monthlyExpense = $monthlyTotals['pengeluaran'] ?? 0;

        // ── Daily & Monthly budget progress ──────────────────────────────
        $dailyBudget = Budget::where('user_id', $userId)
            ->where('period', 'harian')
            ->first();
            
        $monthlyBudget = Budget::where('user_id', $userId)
            ->where('period', 'bulanan')
            ->first();

        // Join lebih cepat daripada whereHas
        $dailyExpense = DB::table('transactions')
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $userId)
            ->where('transactions.transaction_date', $now->toDateString())
            ->where('categories.type', 'pengeluaran')
            ->sum('transactions.amount');
            
        $dailyAmount = $dailyBudget ? (int) $dailyBudget->amount : 0;
        $monthlyAmount = $monthlyBudget ? (int) $monthlyBudget->amount : 0;

        // Tentukan mana yang aktif
        if ($monthlyAmount > 0 && $dailyAmount == 0) {
            $activeBudgetTotal = $monthlyAmount;
            $activeBudgetUsed = (int) $monthlyExpense;
            $budgetLabel = 'Pengeluaran budget bulanan';
        } else {
            $activeBudgetTotal = $dailyAmount;
            $activeBudgetUsed = (int) $dailyExpense;
            $budgetLabel = 'Pengeluaran budget harian';
        }

        // ── Top spending categories for donut chart (current month) ─────
        $spendingByCategory = DB::table('transactions')
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $userId)
            ->whereYear('transactions.transaction_date', $now->year)
            ->whereMonth('transactions.transaction_date', $now->month)
            ->where('categories.type', 'pengeluaran')
            ->selectRaw('categories.name, categories.color, SUM(transactions.amount) as amount')
            ->groupBy('categories.name', 'categories.color')
            ->orderByDesc('amount')
            ->limit(5)
            ->get()
            ->map(function ($data) {
                return [
                    'name' => $data->name,
                    'value' => (int) $data->amount,
                    'color' => $data->color,
                ];
            });

        // ── 5 most recent transactions ──────────────────────────────────
        $recentTransactions = Transaction::with('category')
            ->where('user_id', $userId)
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get()
            ->map(fn (Transaction $t) => [
                'id' => $t->id,
                'name' => $t->description,
                'amount' => $t->category->type === 'pengeluaran' ? -(int) $t->amount : (int) $t->amount,
                'date' => Carbon::parse($t->transaction_date)->translatedFormat('d M Y'),
                'category' => $t->category->name,
            ]);

        return response()->json([
            'monthLabel' => $now->translatedFormat('F Y'),
            'income' => (int) $monthlyIncome,
            'expense' => (int) $monthlyExpense,
            'dailyBudgetTotal' => $activeBudgetTotal,
            'dailyBudgetUsed' => $activeBudgetUsed,
            'budgetLabel' => $budgetLabel,
            'spendingData' => $spendingByCategory,
            'recentTransactions' => $recentTransactions,
            'netBalance' => $monthlyIncome - $monthlyExpense,
        ]);
    }
}
