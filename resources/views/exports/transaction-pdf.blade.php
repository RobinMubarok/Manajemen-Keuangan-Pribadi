<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Export PDF Transaksi</title>
    <style>
        @page {
            margin: 20px;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 10pt;
            color: #000;
            margin: 0;
            padding: 0;
        }

        /* Tabel Data Transaksi */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            border: 0.5pt solid #000; /* Border luar sesuai permintaan */
        }

        /* Header Tabel Hitam Teks Putih */
        .data-table thead th {
            background-color: #000000;
            color: #ffffff;
            font-weight: bold;
            padding: 6px 8px;
            text-align: left;
            border: 0.5pt solid #000000;
        }

        /* Sel Data */
        .data-table tbody td {
            padding: 6px 8px;
            border-left: 0.5pt solid #000;
            border-right: 0.5pt solid #000;
            border-bottom: 0.5pt solid #000;
        }

        /* Tidak ada zebra striping seperti contoh gambar box yang diberikan user (putih semua dengan garis hitam), 
           atau jika diinginkan zebra striping hapus komentar di bawah ini:
           .data-table tbody tr:nth-child(even) { background-color: #f2f2f2; } 
        */

        .text-right {
            text-align: right;
        }
    </style>
</head>
<body>

    <table class="data-table">
        <thead>
            <tr>
                <th width="15%">Tanggal</th>
                <th width="20%">Kategori</th>
                <th width="40%">Deskripsi</th>
                <th width="25%" class="text-right">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $trx)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($trx->date)->format('d/m/Y') }}</td>
                    <td>{{ $trx->category->name ?? 'Lainnya' }}</td>
                    <td>{{ $trx->description ?? '-' }}</td>
                    <td class="text-right">
                        @if($trx->type === 'income')
                            +Rp. {{ number_format($trx->amount, 0, ',', '.') }}
                        @else
                            -Rp. {{ number_format($trx->amount, 0, ',', '.') }}
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

</body>
</html>
