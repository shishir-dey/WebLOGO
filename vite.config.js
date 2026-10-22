import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub supplies the project path (or an empty path for a custom domain).
  base: `${process.env.PAGES_BASE_PATH || ''}/`,
});
