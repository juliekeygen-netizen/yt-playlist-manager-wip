import { SettingsButton, SettingsSection } from '../SettingsRow';

const repoUrl = 'https://github.com/juliekeygen-netizen/yt-playlist-manager-wip';

export function AboutSettings({ onNotImplemented }: { onNotImplemented: (title: string) => void }) {
  return (
    <div className="space-y-7">
      <SettingsSection title="YT Playlist Manager">
        <div className="space-y-4 px-4 py-4">
          <div>
            <div className="text-sm text-mist-500">Version</div>
            <div className="mt-1 text-base font-semibold text-mist-100">0.1.0</div>
          </div>
          <div>
            <div className="text-sm text-mist-500">Status</div>
            <div className="mt-1 text-base font-semibold text-mist-100">Work-in-progress UI prototype</div>
          </div>
          <p className="text-sm leading-6 text-mist-300">
            Desktop UI prototype for safer YouTube playlist management.
          </p>
        </div>
      </SettingsSection>

      <SettingsSection title="Built with">
        <div className="grid grid-cols-2 gap-3 p-4 text-sm text-mist-200">
          {['Electron', 'React', 'TypeScript', 'Vite', 'Tailwind'].map((item) => (
            <div key={item} className="rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-2">
              {item}
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Links">
        <div className="grid grid-cols-3 gap-3 p-4">
          <SettingsButton onClick={() => window.open(repoUrl, '_blank', 'noopener,noreferrer')}>
            GitHub repository
          </SettingsButton>
          <SettingsButton onClick={() => onNotImplemented('Report issue')}>Report issue</SettingsButton>
          <SettingsButton onClick={() => onNotImplemented('Open app data folder')}>
            Open app data folder
          </SettingsButton>
        </div>
      </SettingsSection>
    </div>
  );
}
