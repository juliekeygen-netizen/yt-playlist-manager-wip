/// <reference types="vite/client" />

interface Window {
  windowControls?: {
    minimize: () => void;
    toggleMaximize: () => void;
    close: () => void;
  };
}
