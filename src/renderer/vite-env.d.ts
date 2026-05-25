/// <reference types="vite/client" />

interface Window {
  windowControls?: {
    minimize: () => Promise<void>;
    close: () => Promise<void>;
  };
}
