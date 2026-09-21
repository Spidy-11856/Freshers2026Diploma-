import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves this project from /Freshers2026Diploma-/ rather than /
  // Keep other deployments (for example Cloudflare Pages) at the domain root.
  base: process.env.GITHUB_ACTIONS ? '/Freshers2026Diploma-/' : '/',
  build: { outDir: 'dist', sourcemap: true }
});
