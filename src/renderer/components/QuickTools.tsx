import { quickTools } from '@shared/mockData';
import { iconAccent } from './accent';

export function QuickTools() {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold tracking-[-0.02em] text-mist-50">Quick Tools</h2>
      <div className="grid grid-cols-4 gap-5">
        {quickTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <article
              key={tool.title}
              className="panel flex min-h-[136px] items-center gap-5 rounded-lg p-5 text-left transition hover:-translate-y-0.5 hover:border-white/20"
            >
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg ring-1 ${iconAccent[tool.accent]}`}>
                <Icon size={29} strokeWidth={1.9} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold leading-5 text-mist-50">{tool.title}</h3>
                <p className="mt-2 text-[15px] leading-6 text-mist-400">{tool.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
