<?php

if (! function_exists('formatRupiah')) {
    /**
     * Format a numeric value to Indonesian Rupiah currency format.
     * Example: 1500000 => 'Rp. 1.500.000,00'
     *
     * @param  float|int|string  $value
     */
    function formatRupiah($value): string
    {
        $number = is_numeric($value) ? (float) $value : 0;

        return 'Rp. '.number_format($number, 0, ',', '.').',00';
    }
}
