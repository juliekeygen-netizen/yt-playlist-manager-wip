/// <reference types="vite/client" />

import type { YtpmApi } from '@shared/ipc';

declare global {
  interface Window {
    windowControls?: {
      ready: boolean;
      ping: () => Promise<boolean>;
      minimize: () => Promise<boolean>;
      close: () => Promise<boolean>;
      reload: () => Promise<boolean>;
      hardReload: () => Promise<boolean>;
      relaunch: () => Promise<boolean>;
    };
    ytpm?: YtpmApi;
  }
}

export {};
