<?php

namespace App\Http\Controllers;

use App\Exports\TransactionsExport;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    /**
     * Export transactions as PDF.
     * Includes net balance (total income - total expense).
     */
    public function exportPdf(Request $request): StreamedResponse
    {
        $userId = auth()->id();
        $query = Transaction::where('user_id', $userId);
        if ($request->filled('month') && $request->filled('year')) {
            $query->whereMonth('transaction_date', (int) $request->month)
                  ->whereYear('transaction_date', (int) $request->year);
        }
        $transactions = $query->with('category')->orderBy('transaction_date', 'desc')->get();
        $totalIncome = $transactions->where('category.type', 'pemasukan')->sum('amount');
        $totalExpense = $transactions->where('category.type', 'pengeluaran')->sum('amount');
        $netBalance = $totalIncome - $totalExpense;

        $pdf = Pdf::loadView('exports.transaction-pdf', compact('transactions', 'totalIncome', 'totalExpense', 'netBalance'));
        return $pdf->download('transaksi.pdf');
    }

    /**
     * Export transactions as Excel.
     * Adds a summary row with total income, total expense, and net balance.
     */
    public function exportExcel(Request $request): StreamedResponse
    {
        $userId = auth()->id();
        $query = Transaction::where('user_id', $userId);
        if ($request->filled('month') && $request->filled('year')) {
            $query->whereMonth('transaction_date', (int) $request->month)
                  ->whereYear('transaction_date', (int) $request->year);
        }
        $transactions = $query->with('category')->orderBy('transaction_date', 'desc')->get();
        $totalIncome = $transactions->where('category.type', 'pemasukan')->sum('amount');
        $totalExpense = $transactions->where('category.type', 'pengeluaran')->sum('amount');
        $netBalance = $totalIncome - $totalExpense;

        return Excel::download(new TransactionsExport($transactions, $totalIncome, $totalExpense, $netBalance), 'transaksi.xlsx');
    }
}
