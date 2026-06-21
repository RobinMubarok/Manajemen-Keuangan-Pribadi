<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Return dashboard summary data for the authenticated user.
     * Includes: monthly income/expense, daily budget progress, top spending
     * categories (donut chart), and 5 most recent transactions.
     */
    public function index(): JsonResponse
    {
        $userId = auth()->id();
        $now = Carbon::now();

        // ── Monthly income & expense (current month) ────────────────────
        $monthlyIncome = Transaction::where('user_id', $userId)
            ->whereYear('transaction_date', $now->year)
            ->whereMonth('transaction_date', $now->month)
            ->whereHas('category', fn ($q) => $q->where('type', 'pemasukan'))
            ->sum('amount');

        $monthlyExpense = Transaction::where('user_id', $userId)
            ->whereYear('transaction_date', $now->year)
            ->whereMonth('transaction_date', $now->month)
            ->whereHas('category', fn ($q) => $q->where('type', 'pengeluaran'))
            ->sum('amount');

        // ── Daily budget progress (today) ───────────────────────────────
        $dailyBudget = Budget::where('user_id', $userId)
            ->where('period', 'harian')
            ->first();

        $dailyExpense = Transaction::where('user_id', $userId)
            ->where('transaction_date', $now->toDateString())
            ->whereHas('category', fn ($q) => $q->where('type', 'pengeluaran'))
            ->sum('amount');

        // ── Top spending categories for donut chart (current month) ─────
        $spendingByCategory = Transaction::with('category')
            ->where('user_id', $userId)
            ->whereYear('transaction_date', $now->year)
            ->whereMonth('transaction_date', $now->month)
            ->whereHas('category', fn ($q) => $q->where('type', 'pengeluaran'))
            ->get()
            ->groupBy(fn ($t) => $t->category->name)
            ->map(function ($group) {
                return [
                    'amount' => $group->sum('amount'),
                    'color' => $group->first()->category->color,
                ];
            })
            ->sortByDesc('amount')
            ->take(5)
            ->map(fn ($data, $name) => [
                'name' => $name,
                'value' => (int) $data['amount'],
                'color' => $data['color'],
            ])
            ->values();

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
            'dailyBudgetTotal' => $dailyBudget ? (int) $dailyBudget->amount : 0,
            'dailyBudgetUsed' => (int) $dailyExpense,
            'spendingData' => $spendingByCategory,
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
