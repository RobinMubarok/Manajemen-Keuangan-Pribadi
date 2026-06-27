<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class TransactionsExport implements FromArray, WithHeadings
{
    protected array $rows;
    protected int $totalIncome;
    protected int $totalExpense;
    protected int $netBalance;

    public function __construct($transactions, int $totalIncome, int $totalExpense, int $netBalance)
    {
        // Map transaction rows
        $this->rows = $transactions->map(function ($trx) {
            $date = $trx->transaction_date ? $trx->transaction_date->format('d/m/Y') : '';
            $category = $trx->category->name ?? 'Lainnya';
            $description = $trx->description ?? '-';
            $amount = $trx->type === 'income'
                ? '+Rp. ' . number_format($trx->amount, 0, ',', '.')
                : '-Rp. ' . number_format($trx->amount, 0, ',', '.');
            return [$date, $category, $description, $amount];
        })->toArray();

        // Add an empty separator row
        $this->rows[] = ['', '', '', ''];

        // Summary rows
        $this->rows[] = ['Total Pemasukan', '', '', 'Rp. ' . number_format($totalIncome, 0, ',', '.')];
        $this->rows[] = ['Total Pengeluaran', '', '', 'Rp. ' . number_format($totalExpense, 0, ',', '.')];
        $this->rows[] = ['Saldo Akhir', '', '', 'Rp. ' . number_format($netBalance, 0, ',', '.')];
    }

    public function array(): array
    {
        return $this->rows;
    }

    public function headings(): array
    {
        return ['Tanggal', 'Kategori', 'Deskripsi', 'Jumlah'];
    }
}
