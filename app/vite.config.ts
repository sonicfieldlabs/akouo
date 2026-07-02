import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const exposeDevServer = env.AKOUO_EXPOSE_DEV_SERVER === 'true';
  const host = exposeDevServer ? '0.0.0.0' : 'localhost';
  const allowedHosts = (env.AKOUO_ALLOWED_HOSTS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    plugins: [react()],
    server: {
      host,
      port: 5173,
      strictPort: true,
      allowedHosts,
    },
    preview: {
      host,
      port: 4173,
      strictPort: true,
      allowedHosts,
    },
  };
});
