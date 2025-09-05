import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'url';

// Fix for __dirname not being defined in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    const env = loadEnv(mode, process.cwd(), '');

    // Create a define object for process.env variables to be exposed to the client.
    // This will automatically expose all variables prefixed with VITE_
    const processEnv = {};
    for (const key in env) {
      if (key.startsWith('VITE_')) {
        processEnv[`process.env.${key}`] = JSON.stringify(env[key]);
      }
    }

    return {
      define: processEnv,
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});