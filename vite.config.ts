import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [preact()],
    server: {
        allowedHosts: ['desktop-csa7m2j.tail2ff47e.ts.net', 'localhost']
    }
});
