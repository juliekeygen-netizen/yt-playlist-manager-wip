# YT Playlist Manager

Initial Electron + React + TypeScript + Vite + Tailwind CSS desktop UI shell for a YouTube playlist manager.

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

This version is a polished mock dashboard only. It does not implement YouTube API access, cookie parsing, authentication, file export, settings persistence, database storage, or playlist modifications.
