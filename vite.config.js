import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
            fonts: [
                bunny('Inter', {
                    weights: [400, 500, 600, 700],
                }),
            ],
        }),
        tailwindcss(),
    ],

    /* ── JSX transform via esbuild (built-in) ── */
    esbuild: {
        jsx: 'automatic',
        jsxImportSource: 'react',
    },

    /* ── Pre-bundle saat dev ── */
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-dom/client',
            'react/jsx-runtime',
            'react-is',
            'recharts',
            'lucide-react',
        ],
    },

    resolve: {
        conditions: ['browser', 'import', 'module', 'default'],
    },

    /* ── Paksa Rollup (bukan rolldown) untuk production build ── */
    build: {
        rollupOptions: {
            /* pastikan tidak ada yang di-external-kan */
            external: [],
            output: {
                /* Pisah vendor agar cache browser lebih optimal */
                manualChunks(id) {
                    if (id.includes('node_modules/react') ||
                        id.includes('node_modules/react-dom') ||
                        id.includes('node_modules/react-is') ||
                        id.includes('node_modules/scheduler')) {
                        return 'react-vendor';
                    }
                    if (id.includes('node_modules/recharts') ||
                        id.includes('node_modules/d3') ||
                        id.includes('node_modules/victory')) {
                        return 'chart-vendor';
                    }
                    if (id.includes('node_modules/lucide')) {
                        return 'icons-vendor';
                    }
                },
            },
        },
    },

    server: {
        host: '127.0.0.1',
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
