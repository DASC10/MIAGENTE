declare module 'lucide-react';

interface ImportMetaEnv {
  readonly VITE_NETLIFY: string;
  // Más variables de entorno aquí
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}