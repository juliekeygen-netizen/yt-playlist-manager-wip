# YT Playlist Manager WIP

Work-in-progress Electron + React + TypeScript + Vite + Tailwind CSS desktop UI prototype for managing YouTube playlists.

## Getting Started

```bash
npm install
npm run dev
```

### WSL/Linux Desktop Dependencies

If `npm run dev` builds successfully but Electron fails with missing shared libraries such as `libnss3.so` or `libasound.so.2`, install the native desktop dependencies for your Linux/WSL distribution. On Ubuntu/Debian:

```bash
sudo apt install libnss3 libasound2
```

## Build

```bash
npm run build
```

## Notes

This is currently a mock UI/prototype. It includes Home, Playlists, and Queue screens with mock playlist data, mock copy/move/remove workflows, context menus, filtering, sorting, pagination, manual reorder UI, and mock queue operation details.

It does not yet implement real YouTube API access, cookie parsing, authentication, persistent app data, real export, database storage, or real playlist modifications.
