import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

/** Warna per kategori — green-toned palette for dark theme */
const COLORS = ['#4ade80', '#22c55e', '#86efac', '#fbbf24', '#f87171'];

/**
 * Tooltip custom agar tampil dalam Bahasa Indonesia dengan format Rupiah.
 */
function CustomTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        const { name, value } = payload[0];
        return (
            <div
                className="rounded-xl px-3 py-2 text-xs"
                style={{
                    backgroundColor: 'var(--bg-overlay)',
                    border: '1px solid var(--border-default)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
            >
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {name}
                </p>
                <p className="font-bold" style={{ color: 'var(--accent)' }}>
                    {value}%
                </p>
            </div>
        );
    }
    return null;
}

/**
 * Legend custom di sebelah kanan donut chart.
 */
function CustomLegend({ data }) {
    return (
        <ul className="space-y-2">
            {data.map((entry, index) => (
                <li key={entry.name} className="flex items-center justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <span
                            className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span
                            className="text-xs truncate"
                            style={{ color: 'var(--text-body)' }}
                        >
                            {entry.name}
                        </span>
                    </div>
                    <span
                        className="text-xs font-semibold flex-shrink-0"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {entry.value}%
                    </span>
                </li>
            ))}
        </ul>
    );
}

/**
 * SpendingDonutChart
 *
 * Donut chart analisis pengeluaran per kategori menggunakan Recharts.
 *
 * @param {Array}  data  - Array of { name: string, value: number }
 * @param {string} total - Label total di tengah donut (e.g. "Rp 5,8jt")
 */
export default function SpendingDonutChart({ data, total }) {
    return (
        <div
            className="rounded-2xl p-5 h-full"
            style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
            }}
        >
            <h3
                className="text-sm font-semibold mb-4"
                style={{ color: 'var(--text-body)' }}
            >
                Pengeluaran per Kategori
            </h3>

            <div className="flex items-center gap-4">
                {/* Donut */}
                <div className="relative w-36 h-36 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={42}
                                outerRadius={62}
                                paddingAngle={3}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                            >
                                {data.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke="none"
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Label total di tengah */}
                    {total && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span
                                className="text-[10px]"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Total
                            </span>
                            <span
                                className="text-sm font-bold leading-tight"
                                style={{ color: 'var(--accent)' }}
                            >
                                {total}
                            </span>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="flex-1 min-w-0">
                    <CustomLegend data={data} />
                </div>
            </div>
        </div>
    );
}
