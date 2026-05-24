import type { QuickAction } from '@shared/mockData';
import { buttonAccent, cardAccent, iconAccent } from './accent';

export function QuickActionCard({ action }: { action: QuickAction }) {
  const Icon = action.icon;

  return (
    <article className={`panel group grid min-h-[188px] grid-cols-[76px_1fr] gap-5 rounded-lg p-6 transition duration-200 hover:-translate-y-0.5 ${cardAccent[action.accent]}`}>
      <div
        className={`flex h-[72px] w-[72px] items-center justify-center rounded-lg ring-1 ${iconAccent[action.accent]}`}
      >
        <Icon size={35} strokeWidth={1.9} />
      </div>
      <div className="flex min-w-0 flex-col">
        <h3 className="text-[17px] font-semibold leading-6 text-mist-50">{action.title}</h3>
        <p className="mt-1.5 max-w-[18rem] text-[15px] leading-6 text-mist-400">{action.description}</p>
        <button
          className={`mt-auto w-full max-w-[194px] rounded-md bg-gradient-to-r px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition ${buttonAccent[action.accent]}`}
        >
          {action.buttonLabel}
        </button>
      </div>
    </article>
  );
}
