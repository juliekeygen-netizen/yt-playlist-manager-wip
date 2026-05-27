import { AlertTriangle, Cog, Info, Lock, Shield, ShieldCheck } from 'lucide-react';
import { PopupModalFrame } from './modals/PopupModalFrame';

export function SafetyNoteOverlay({ onClose }: { onClose: () => void }) {
  const items = [
    {
      Icon: Cog,
      title: '1. Work-in-progress prototype',
      text: 'This app is currently a UI prototype using mock and local state for most behavior.',
      tone: 'blue',
    },
    {
      Icon: AlertTriangle,
      title: '2. Important limitations',
      text: 'This kind of playlist manager may rely on browser session cookies, scraping, or reverse-engineered YouTube interfaces instead of the official YouTube Data API. Those can change or stop working without notice.',
      tone: 'amber',
    },
    {
      Icon: Shield,
      title: '3. Use with care',
      text: 'Playlist actions can affect your real YouTube account once backend functionality is implemented, so always review destructive actions carefully.',
      tone: 'purple',
    },
    {
      Icon: Lock,
      title: '4. Session and privacy',
      text: 'Only use cookies or sessions from accounts you own or control. Session data and exports should stay local unless you explicitly choose to share them.',
      tone: 'green',
    },
    {
      Icon: Info,
      title: '5. Queue and recovery',
      text: 'Queue confirmation and restore/backup workflows reduce accidental changes, but they are not a substitute for caution.',
      tone: 'blue',
    },
  ] as const;

  return (
    <PopupModalFrame
      title="Safety note"
      subtitle="Before connecting a session, please read this first."
      maxWidth="max-w-[690px]"
      icon={<ShieldCheck className="mt-1 text-blue-300" size={32} />}
      tuningGroup="main"
      footer={
        <div className="flex justify-end gap-3">
          <button className="rounded-lg border border-white/[0.10] bg-white/[0.045] px-5 py-2.5 text-sm font-semibold text-mist-200 transition hover:bg-white/[0.08]" onClick={onClose} type="button">
            Close
          </button>
          <button className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500" onClick={onClose} type="button">
            I understand
          </button>
        </div>
      }
      onClose={onClose}
    >
      <div className="mb-4 rounded-lg border border-amber-300/25 bg-amber-500/10 px-4 py-3 text-center text-sm font-semibold text-amber-200">
        Experimental software — use at your own risk.
      </div>
      <div className="space-y-2.5">
        {items.map(({ Icon, title, text, tone }) => (
          <div key={title} className="flex gap-4 rounded-xl border border-white/[0.08] bg-white/[0.035] p-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${toneClass[tone]}`}>
              <Icon size={25} />
            </div>
            <div>
              <h3 className="font-semibold text-mist-50">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-mist-300">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </PopupModalFrame>
  );
}

const toneClass = {
  blue: 'border border-blue-300/15 bg-blue-500/14 text-blue-200',
  amber: 'border border-amber-300/15 bg-amber-500/14 text-amber-200',
  purple: 'border border-violet-300/15 bg-violet-500/14 text-violet-200',
  green: 'border border-emerald-300/15 bg-emerald-500/14 text-emerald-200',
};
