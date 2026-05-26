/// <reference types="vite/client" />

interface Window {
  windowControls?: {
    ready: boolean;
    ping: () => Promise<boolean>;
    minimize: () => Promise<boolean>;
    close: () => Promise<boolean>;
  };
}
