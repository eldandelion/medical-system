import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode || 'development', process.cwd(), '');
    const backendPort = process.env.BACKEND_PORT || env.BACKEND_PORT || '8080';

    return {
        base: '/medical-system/',
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            },
        },
        server: {
            // HMR is disabled in AI Studio via DISABLE_HMR env var.
            // Do not modify file watching is disabled to prevent flickering during agent edits.
            hmr: process.env.DISABLE_HMR !== 'true',
            proxy: {
                '/medical-system/api': {
                    target: `http://127.0.0.1:${backendPort}`,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/medical-system\/api/, '/api'),
                },
                '^/api': {
                    target: `http://127.0.0.1:${backendPort}`,
                    changeOrigin: true,
                },
            },
        },
        test: {
            environment: 'jsdom',
        },
    };
});