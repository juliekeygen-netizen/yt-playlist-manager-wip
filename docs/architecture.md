# Architecture Notes

This app uses Electron with a strict renderer/main-process split.

- The renderer should talk to backend capabilities only through the safe `window.ytpm` preload API.
- The preload layer exposes typed wrappers and must never expose `ipcRenderer` directly.
- Main-process services own file-system access, session metadata, future cookie handling, queue execution, backups, exports, and YouTube integration.
- Shared types in `src/shared` are renderer-safe and must not include raw cookies or secret session contents.
- App data lives under Electron `app.getPath('userData')` with lazily created folders for `settings`, `sessions`, `backups`, `exports`, `logs`, and `cache`.
- Settings persistence is still renderer-side `localStorage` for now, but it is sanitized against shared defaults on load/save and is ready to migrate to main-process JSON storage later.
- Session metadata may be persisted safely, but raw cookies must stay out of renderer state and localStorage.
- Future real playlist mutations should flow through Queue operations rather than direct renderer actions.
- Destructive operations should create backup/history records before they run.
- Export location browsing already goes through a main-process save dialog over typed preload IPC.
- Session switching, cookie updates, and session removal should be blocked while real queue operations are running.
- The current service layer is intentionally skeletal: it returns mock or not-implemented results and does not call YouTube.
