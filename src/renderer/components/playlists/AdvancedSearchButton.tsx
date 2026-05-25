import { Search, SlidersHorizontal } from 'lucide-react';

export function AdvancedSearchButton() {
  return (
    <button
      aria-label="Advanced video search"
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/[0.09] bg-white/[0.035] text-mist-300 transition hover:border-blue-300/40 hover:bg-blue-500/10 hover:text-blue-200"
    >
      <Search size={17} />
      <SlidersHorizontal size={12} className="absolute bottom-2 right-2 text-blue-300" />
    </button>
  );
}
