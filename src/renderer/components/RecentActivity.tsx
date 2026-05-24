import { ArrowRight } from 'lucide-react';
import { recentActivity } from '@shared/mockData';
import { textAccent } from './accent';

export function RecentActivity() {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-mist-50">Recent Activity</h2>
        <button className="flex items-center gap-2 text-sm font-medium text-blue-300 transition hover:text-blue-200">
          View all activity
          <ArrowRight size={17} />
        </button>
      </div>

      <div className="panel overflow-hidden rounded-lg">
        {recentActivity.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.text}
              className={`grid grid-cols-[36px_1fr_170px_118px] items-center gap-5 px-5 py-4 text-sm ${
                index !== recentActivity.length - 1 ? 'border-b border-white/[0.055]' : ''
              }`}
            >
              <Icon size={20} className={textAccent[activity.accent]} />
              <span className="text-mist-300">{activity.text}</span>
              <span className="text-mist-500">{activity.time}</span>
              <span className="rounded-md bg-emerald-400/15 px-3 py-1 text-center text-xs font-medium text-emerald-300">
                {activity.status}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
