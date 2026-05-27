# Architecture Notes

This app uses Electron with a strict renderer/main-process split.

- The renderer should talk to backend capabilities only through the safe `window.ytpm` preload API.
- The preload layer exposes typed wrappers and must never expose `ipcRenderer` directly.
- Main-process services own file-system access, session metadata, future cookie handling, queue execution, backups, and YouTube integration.
- Shared types in `src/shared` are renderer-safe and must not include raw cookies or secret session contents.
- Future real playlist mutations should flow through Queue operations rather than direct renderer actions.
- Destructive operations should create backup/history records before they run.
- Session switching, cookie updates, and session removal should be blocked while real queue operations are running.
- The current service layer is intentionally skeletal: it returns mock or not-implemented results and does not call YouTube.
