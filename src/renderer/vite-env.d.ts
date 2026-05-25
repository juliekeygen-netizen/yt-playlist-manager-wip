/// <reference types="vite/client" />

interface Window {
  windowControls?: {
    ready: boolean;
    minimize: () => Promise<void>;
    close: () => Promise<void>;
  };
}
