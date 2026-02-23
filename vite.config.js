import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: process.env.VITE_BASE || '/bazifenxi/',
  server: {
    port: 3000,
    open: true
  }
});
