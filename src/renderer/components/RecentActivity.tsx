import { ArrowRight } from 'lucide-react';
import type { QueueOperation } from '@shared/queueMockData';

export function RecentActivity({
  activities,
  onViewAll,
}: {
  activities: QueueOperation[];
  onViewAll?: () => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-mist-50">Recent Activity</h2>
        <button className="flex items-center gap-2 text-sm font-medium text-blue-300 transition hover:text-blue-200" onClick={onViewAll} type="button">
          View all activity
          <ArrowRight size={17} />
        </button>
      </div>

      <div className="panel overflow-hidden rounded-lg">
        {activities.map((activity, index) => {
          return (
            <div
              key={activity.id}
              className={`grid grid-cols-[36px_1fr_170px_118px] items-center gap-5 px-5 py-4 text-sm ${
                index !== activities.length - 1 ? 'border-b border-white/[0.055]' : ''
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-blue-400 shadow-[0_0_14px_rgba(96,165,250,0.5)]" />
              <span className="text-mist-300">{activity.title} · {activity.source}</span>
              <span className="text-mist-500">{activity.createdAt}</span>
              <span className="rounded-md bg-blue-400/15 px-3 py-1 text-center text-xs font-medium text-blue-300">
                {activity.status}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
