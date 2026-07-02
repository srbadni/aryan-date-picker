import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'aryan-date-picker/styles.css': path.resolve(__dirname, '../../packages/date-picker/src/styles.css'),
      'aryan-date-picker': path.resolve(__dirname, '../../packages/date-picker/src/index.ts'),
    },
  },
});
