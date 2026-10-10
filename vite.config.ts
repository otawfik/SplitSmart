import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// dev only: answer /api/gemini with the same server function Vercel runs in production
const geminiApi = (): Plugin => ({
  name: 'gemini-api-dev',
  configureServer(server) {
    server.middlewares.use('/api/gemini', async (req, res) => {
      const mod = await server.ssrLoadModule('/api/gemini.ts');
      const body = await new Promise<string>((resolve) => {
        let d = '';
        req.on('data', (c) => (d += c));
        req.on('end', () => resolve(d));
      });
      const response: Response = await mod.POST(new Request('http://localhost/api/gemini', { method: 'POST', body }));
      res.statusCode = response.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(await response.text());
    });
  },
});

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // only when set: process.env coerces undefined to the string "undefined"
    if (env.GEMINI_API_KEY) process.env.GEMINI_API_KEY ??= env.GEMINI_API_KEY;
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), geminiApi()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
