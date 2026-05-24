import type { Accent } from '@shared/mockData';

export const iconAccent: Record<Accent, string> = {
  purple: 'bg-violet-500/20 text-violet-200 ring-violet-300/15',
  blue: 'bg-blue-500/20 text-blue-200 ring-blue-300/15',
  green: 'bg-emerald-500/20 text-emerald-200 ring-emerald-300/15',
  rose: 'bg-rose-500/20 text-rose-200 ring-rose-300/15',
  amber: 'bg-amber-500/20 text-amber-200 ring-amber-300/15',
};

export const buttonAccent: Record<Accent, string> = {
  purple: 'from-violet-500 to-violet-700 hover:from-violet-400 hover:to-violet-600',
  blue: 'from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600',
  green: 'from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600',
  rose: 'from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600',
  amber: 'from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600',
};

export const cardAccent: Record<Accent, string> = {
  purple: 'border-violet-400/35 shadow-violet-950/20',
  blue: 'border-blue-400/35 shadow-blue-950/20',
  green: 'border-emerald-400/30 shadow-emerald-950/20',
  rose: 'border-rose-400/30 shadow-rose-950/20',
  amber: 'border-amber-400/30 shadow-amber-950/20',
};

export const textAccent: Record<Accent, string> = {
  purple: 'text-violet-300',
  blue: 'text-blue-300',
  green: 'text-emerald-300',
  rose: 'text-rose-300',
  amber: 'text-amber-300',
};
