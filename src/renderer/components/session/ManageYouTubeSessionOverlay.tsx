import {
  AlertTriangle,
  Check,
  CircleSlash,
  ClipboardPaste,
  Cookie,
  FileUp,
  FolderOpen,
  LogOut,
  Mail,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  User,
  UserRoundCog,
  Users,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, ReactNode } from 'react';
import { createMockSessionTimestamps, type MockSessionInfo } from '@shared/sessionMockData';

type CookieMode = 'update' | 'import';
type CookieSource = 'file' | 'paste';

type SessionChildModal =
  | { type: 'cookies'; mode: CookieMode }
  | { type: 'pasteCookies'; mode: CookieMode }
  | { type: 'switchAccount' }
  | { type: 'savedSessions' }
  | { type: 'confirmSwitch'; sessionId: string }
  | { type: 'removeSession' }
  | { type: 'mockNotice'; title: string; description: string };

interface SavedSession {
  id: string;
  accountName: string;
  email: string;
  initials: string;
  status: 'Connected' | 'Expired';
  lastUsed: string;
}

// TODO: Wire this to real queue running operation state once queue execution is implemented.
const operationsRunning = false;
const cookieValidationMessage = 'Cookies must include youtube.com entries.';

const savedSessions: SavedSession[] = [
  {
    id: 'test-account',
    accountName: 'Test account',
    email: 'test.account@gmail.com',
    initials: 'TA',
    status: 'Connected',
    lastUsed: '2 min ago',
  },
  {
    id: 'personal-backup',
    accountName: 'Personal Backup',
    email: 'personal.backup@gmail.com',
    initials: 'PB',
    status: 'Connected',
    lastUsed: '3 days ago',
  },
  {
    id: 'work-account',
    accountName: 'Work Account',
    email: 'work.account@gmail.com',
    initials: 'WA',
    status: 'Expired',
    lastUsed: '2 weeks ago',
  },
];

export function ManageYouTubeSessionOverlay({
  session,
  onClose,
  onRefreshSession,
  onRemoveSession,
  onUseSession,
}: {
  session: MockSessionInfo;
  onClose: () => void;
  onRefreshSession: () => void;
  onRemoveSession: () => void;
  onUseSession: (session: MockSessionInfo) => void;
}) {
  const connected = session.state === 'connected';
  const [childModal, setChildModal] = useState<SessionChildModal | null>(null);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (childModal) {
        setChildModal(null);
      } else {
        onClose();
      }
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [childModal, onClose]);

  function completeMockImport() {
    onUseSession({
      state: 'connected',
      accountName: 'Test account',
      email: 'test.account@gmail.com',
      initials: 'TA',
      connectionStatus: 'Connected',
      sessionSource: 'Imported cookies',
      ...createMockSessionTimestamps(),
      health: {
        sessionDataLoaded: true,
        signInCheckPassed: true,
        playlistAccessCheckPassed: true,
      },
    });
    setChildModal(null);
  }

  function switchToSavedSession(savedSession: SavedSession) {
    onUseSession({
      state: 'connected',
      accountName: savedSession.accountName,
      email: savedSession.email,
      initials: savedSession.initials,
      connectionStatus: 'Connected',
      sessionSource: 'Saved session',
      ...createMockSessionTimestamps(),
      health: {
        sessionDataLoaded: true,
        signInCheckPassed: true,
        playlistAccessCheckPassed: true,
      },
    });
    setChildModal(null);
  }

  function removeSession() {
    onRemoveSession();
    setChildModal(null);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-[#071523]/62 px-5 py-7 backdrop-blur-[10px]"
        onMouseDown={onClose}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(96,165,250,0.014),transparent_60rem),radial-gradient(circle_at_42%_58%,rgba(20,184,166,0.010),transparent_56rem),radial-gradient(circle_at_58%_62%,rgba(244,114,182,0.006),transparent_52rem)]" />
        <section
          className={`relative z-10 flex h-[min(690px,calc(100vh-56px))] w-[min(820px,calc(100vw-56px))] flex-col overflow-hidden rounded-xl border border-white/[0.18] bg-[#071421]/96 shadow-[0_10px_24px_rgba(0,0,0,0.50)] backdrop-blur-md transition ${
            childModal ? 'pointer-events-none scale-[0.995] opacity-80 blur-[1px]' : ''
          }`}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <header className="flex h-[70px] shrink-0 items-center justify-between border-b border-white/[0.08] px-7">
            <div className="flex items-center gap-3">
              <UserRoundCog size={23} className="text-blue-200" />
              <h2 className="text-xl font-bold tracking-[-0.025em] text-mist-50">
                Manage YouTube session
              </h2>
            </div>
            <button
              aria-label="Close session manager"
              className="rounded-lg p-2 text-mist-300 transition hover:bg-white/[0.07] hover:text-white"
              onClick={onClose}
              type="button"
            >
              <X size={22} />
            </button>
          </header>

          <div className="session-modal-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-7 py-6">
            <section className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-shell-950/35 p-5">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold shadow-lg ${
                  connected
                    ? 'bg-gradient-to-br from-blue-400 to-violet-600 text-white shadow-blue-950/40'
                    : 'border border-white/[0.10] bg-white/[0.055] text-mist-400'
                }`}
              >
                {connected ? session.initials : <User size={27} />}
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-mist-50">
                  {connected ? session.accountName : 'No active session'}
                </h3>
                <p className="mt-1 text-sm text-mist-400">
                  {connected ? 'Current account' : 'No YouTube account is currently loaded.'}
                </p>
              </div>
            </section>

            <section className="mt-5 grid grid-cols-2 gap-4">
              <InfoCard
                Icon={connected ? ShieldCheck : AlertTriangle}
                tone={connected ? 'green' : 'amber'}
                title="Session status"
                value={connected ? session.connectionStatus : 'Not connected'}
                description={connected ? 'Your session is active and healthy.' : 'No active session is currently loaded.'}
              />
              <InfoCard
                Icon={connected ? Cookie : CircleSlash}
                tone={connected ? 'blue' : 'muted'}
                title="Session source"
                value={connected ? session.sessionSource : 'None'}
                description={
                  connected && session.sessionSource === 'Saved session'
                    ? 'Session data was restored from a saved mock session.'
                    : connected
                      ? 'Session data was imported from cookies.'
                      : 'No session loaded.'
                }
              />
              <InfoCard
                Icon={RefreshCw}
                tone={connected ? 'blue' : 'muted'}
                title="Last checked"
                value={connected ? session.lastChecked : '—'}
                description={connected ? 'Connection check completed.' : 'Not available'}
              />
              <InfoCard
                Icon={RotateCcw}
                tone={connected ? 'blue' : 'muted'}
                title="Last refreshed"
                value={connected ? session.lastRefreshed : '—'}
                description={connected ? 'Session refresh completed.' : 'Not available'}
              />
            </section>

            <section className="mt-5 rounded-xl border border-white/[0.08] bg-shell-950/30 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-mist-400">Session health</h3>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {(connected ? connectedHealthItems : disconnectedHealthItems).map((item) => (
                  <div
                    key={item}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-sm ${
                      connected
                        ? 'border-emerald-300/15 bg-emerald-400/[0.055] text-emerald-200'
                        : 'border-white/[0.07] bg-white/[0.035] text-mist-500'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        connected ? 'bg-emerald-400/18 text-emerald-200' : 'bg-white/[0.06] text-mist-500'
                      }`}
                    >
                      {connected ? <Check size={14} /> : <CircleSlash size={13} />}
                    </span>
                    <span className="leading-5">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-5 rounded-xl border border-white/[0.08] bg-shell-950/30 p-4">
              {connected ? (
                <div className="grid grid-cols-4 gap-3">
                  <SessionActionButton Icon={RefreshCw} label="Refresh session" onClick={onRefreshSession} />
                  <SessionActionButton Icon={Cookie} label="Update cookies" onClick={() => setChildModal({ type: 'cookies', mode: 'update' })} />
                  <SessionActionButton Icon={UserRoundCog} label="Switch account" onClick={() => setChildModal({ type: 'switchAccount' })} />
                  <SessionActionButton destructive Icon={X} label="Remove session" onClick={() => setChildModal({ type: 'removeSession' })} />
                </div>
              ) : (
                <div className="mx-auto grid max-w-[520px] grid-cols-2 gap-3">
                  <SessionActionButton Icon={Cookie} label="Import cookies" onClick={() => setChildModal({ type: 'cookies', mode: 'import' })} />
                  <SessionActionButton Icon={UserRoundCog} label="Switch account" onClick={() => setChildModal({ type: 'switchAccount' })} />
                </div>
              )}
            </section>
          </div>
        </section>
      </div>

      {childModal && (
        <SessionChildModalLayer
          currentSession={session}
          modal={childModal}
          onClose={() => setChildModal(null)}
          onCompleteImport={completeMockImport}
          onOpenCookies={(mode) => setChildModal({ type: 'cookies', mode })}
          onOpenPasteCookies={(mode) => setChildModal({ type: 'pasteCookies', mode })}
          onOpenConfirmSwitch={(sessionId) => setChildModal({ type: 'confirmSwitch', sessionId })}
          onOpenRemoveSession={() => setChildModal({ type: 'removeSession' })}
          onOpenSavedSessions={() => setChildModal({ type: 'savedSessions' })}
          onSwitchToSavedSession={switchToSavedSession}
          onRemoveSession={removeSession}
        />
      )}
    </>
  );
}

function SessionChildModalLayer({
  currentSession,
  modal,
  onClose,
  onCompleteImport,
  onOpenCookies,
  onOpenPasteCookies,
  onOpenConfirmSwitch,
  onOpenRemoveSession,
  onOpenSavedSessions,
  onSwitchToSavedSession,
  onRemoveSession,
}: {
  currentSession: MockSessionInfo;
  modal: SessionChildModal;
  onClose: () => void;
  onCompleteImport: () => void;
  onOpenCookies: (mode: CookieMode) => void;
  onOpenPasteCookies: (mode: CookieMode) => void;
  onOpenConfirmSwitch: (sessionId: string) => void;
  onOpenRemoveSession: () => void;
  onOpenSavedSessions: () => void;
  onSwitchToSavedSession: (session: SavedSession) => void;
  onRemoveSession: () => void;
}) {
  const [selectedSavedSessionId, setSelectedSavedSessionId] = useState(() => {
    const currentEmail = currentSession.email;
    return savedSessions.find((savedSession) => savedSession.email === currentEmail)?.id ?? savedSessions[0]?.id ?? '';
  });

  if (modal.type === 'cookies') {
    return (
      <CookieImportModal
        mode={modal.mode}
        onClose={onClose}
        onCompleteImport={onCompleteImport}
        onOpenPasteCookies={onOpenPasteCookies}
      />
    );
  }

  if (modal.type === 'pasteCookies') {
    return (
      <PasteCookiesModal
        onClose={onClose}
        onCompleteImport={onCompleteImport}
      />
    );
  }

  if (modal.type === 'switchAccount') {
    return (
      <SwitchAccountModal
        connected={currentSession.state === 'connected'}
        onClose={onClose}
        onOpenCookies={() => onOpenCookies('import')}
        onOpenRemoveSession={onOpenRemoveSession}
        onOpenSavedSessions={onOpenSavedSessions}
      />
    );
  }

  if (modal.type === 'savedSessions') {
    return (
      <SavedSessionsModal
        selectedSessionId={selectedSavedSessionId}
        onClose={onClose}
        onConfirmSwitch={(sessionId) => {
          setSelectedSavedSessionId(sessionId);
          onOpenConfirmSwitch(sessionId);
        }}
        onSelectSession={setSelectedSavedSessionId}
      />
    );
  }

  if (modal.type === 'confirmSwitch') {
    const targetSession = savedSessions.find((savedSession) => savedSession.id === modal.sessionId) ?? savedSessions[0];
    return (
      <ConfirmSwitchModal
        targetSession={targetSession}
        onClose={onClose}
        onSwitch={() => onSwitchToSavedSession(targetSession)}
      />
    );
  }

  if (modal.type === 'removeSession') {
    return <RemoveSessionModal onClose={onClose} onRemoveSession={onRemoveSession} />;
  }

  return (
    <ChildModalFrame title={modal.title} maxWidth="max-w-[440px]" onClose={onClose}>
      <p className="text-sm leading-6 text-mist-400">{modal.description}</p>
      <div className="mt-6 flex justify-end">
        <ChildButton variant="primary" onClick={onClose}>OK</ChildButton>
      </div>
    </ChildModalFrame>
  );
}

function CookieImportModal({
  mode,
  onClose,
  onCompleteImport,
  onOpenPasteCookies,
}: {
  mode: CookieMode;
  onClose: () => void;
  onCompleteImport: () => void;
  onOpenPasteCookies: (mode: CookieMode) => void;
}) {
  const [source, setSource] = useState<CookieSource>('file');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileText, setSelectedFileText] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const title = mode === 'update' ? 'Update cookies' : 'Import cookies';
  const verb = mode === 'update' ? 'update' : 'import';

  async function readCookieFile(file: File) {
    setIsReadingFile(true);
    setValidationError('');
    setSelectedFileName(file.name);
    try {
      setSelectedFileText(await file.text());
    } catch {
      setSelectedFileText('');
      setValidationError('Unable to read selected cookies file.');
    } finally {
      setIsReadingFile(false);
    }
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void readCookieFile(file);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void readCookieFile(file);
    }
  }

  function importSelectedFile() {
    if (!selectedFileName) {
      setValidationError('Choose a cookies file first.');
      return;
    }

    if (!selectedFileText || !looksLikeYouTubeCookies(selectedFileText)) {
      setValidationError(cookieValidationMessage);
      return;
    }

    onCompleteImport();
  }

  return (
    <ChildModalFrame
      title={title}
      subtitle={`Choose how you want to ${verb} your YouTube session cookies.`}
      maxWidth="max-w-[590px]"
      onClose={onClose}
    >
      <div className="grid grid-cols-2 gap-3">
        <OptionCard
          active={source === 'file'}
          Icon={FileUp}
          title="Import cookies file"
          description="Import cookies from a browser export"
          onClick={() => setSource('file')}
        />
        <OptionCard
          active={source === 'paste'}
          Icon={ClipboardPaste}
          title="Paste cookies"
          description="Paste raw cookies text"
          onClick={() => {
            setSource('paste');
            onOpenPasteCookies(mode);
          }}
        />
      </div>

      {operationsRunning && <OperationBlockedWarning />}

      <div
        className="mt-5 rounded-xl border border-dashed border-blue-200/22 bg-blue-300/[0.045] px-5 py-8 text-center transition hover:bg-blue-300/[0.06]"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-blue-200/18 bg-blue-400/10 text-blue-200">
          <FolderOpen size={21} />
        </div>
        <p className="mt-4 text-sm font-semibold text-mist-100">Drag and drop your cookies file here</p>
        <button
          className="mt-3 rounded-lg border border-white/[0.10] bg-white/[0.055] px-4 py-2 text-sm font-semibold text-mist-100 transition hover:bg-white/[0.09]"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          Browse file
        </button>
        <input
          ref={fileInputRef}
          className="hidden"
          type="file"
          accept=".txt,.json,.cookies"
          onChange={handleFileInputChange}
        />
        {selectedFileName && (
          <p className="mt-3 text-sm text-blue-100">
            Selected: <span className="font-semibold">{selectedFileName}</span>
          </p>
        )}
        <p className="mt-4 text-xs text-mist-500">Supported format: JSON (Netscape), cookies.txt</p>
      </div>
      {validationError && <InlineValidationError message={validationError} />}

      <div className="mt-5 flex justify-end gap-3">
        <ChildButton onClick={onClose}>Cancel</ChildButton>
        <ChildButton
          disabled={operationsRunning || isReadingFile}
          variant="primary"
          onClick={importSelectedFile}
        >
          {isReadingFile ? 'Reading...' : mode === 'update' ? 'Update' : 'Import'}
        </ChildButton>
      </div>
    </ChildModalFrame>
  );
}

function PasteCookiesModal({
  onClose,
  onCompleteImport,
}: {
  onClose: () => void;
  onCompleteImport: () => void;
}) {
  const [cookiesText, setCookiesText] = useState('');
  const [validationError, setValidationError] = useState('');

  function savePastedCookies() {
    if (!looksLikeYouTubeCookies(cookiesText)) {
      setValidationError(cookieValidationMessage);
      return;
    }

    onCompleteImport();
  }

  return (
    <ChildModalFrame
      title="Paste cookies"
      subtitle="Paste your cookies below. Make sure they include youtube.com entries."
      maxWidth="max-w-[540px]"
      onClose={onClose}
    >
      {operationsRunning && <OperationBlockedWarning />}
      <textarea
        className="mt-1 h-36 w-full resize-none rounded-xl border border-white/[0.10] bg-shell-950/62 p-4 text-sm leading-6 text-mist-100 outline-none transition placeholder:text-mist-600 focus:border-blue-300/60"
        placeholder="Paste cookies here..."
        value={cookiesText}
        onChange={(event) => {
          setCookiesText(event.target.value);
          setValidationError('');
        }}
      />
      <p className="mt-3 text-xs text-mist-500">Supported format: Netscape cookies (cookies.txt)</p>
      {validationError && <InlineValidationError message={validationError} />}
      <div className="mt-5 flex justify-end gap-3">
        <ChildButton onClick={onClose}>Cancel</ChildButton>
        <ChildButton
          disabled={operationsRunning || !cookiesText.trim()}
          variant="primary"
          onClick={savePastedCookies}
        >
          Save & Import
        </ChildButton>
      </div>
    </ChildModalFrame>
  );
}

function SwitchAccountModal({
  connected,
  onClose,
  onOpenCookies,
  onOpenRemoveSession,
  onOpenSavedSessions,
}: {
  connected: boolean;
  onClose: () => void;
  onOpenCookies: () => void;
  onOpenRemoveSession: () => void;
  onOpenSavedSessions: () => void;
}) {
  return (
    <ChildModalFrame
      title="Switch account"
      subtitle="Choose how you want to switch your YouTube account."
      maxWidth="max-w-[560px]"
      onClose={onClose}
    >
      <div className="space-y-3">
        <LargeActionCard
          Icon={Users}
          title="Use another saved session"
          description="Switch to a different saved YouTube session"
          onClick={onOpenSavedSessions}
        />
        <LargeActionCard
          Icon={Cookie}
          title="Import new cookies"
          description="Import cookies for a different YouTube account"
          onClick={onOpenCookies}
        />
        {connected && (
          <LargeActionCard
            destructive
            Icon={LogOut}
            title="Remove current session"
            description="Sign out from the current account and stay signed out"
            onClick={onOpenRemoveSession}
          />
        )}
      </div>
      <div className="mt-5 flex justify-end">
        <ChildButton onClick={onClose}>Cancel</ChildButton>
      </div>
    </ChildModalFrame>
  );
}

function SavedSessionsModal({
  selectedSessionId,
  onClose,
  onConfirmSwitch,
  onSelectSession,
}: {
  selectedSessionId: string;
  onClose: () => void;
  onConfirmSwitch: (sessionId: string) => void;
  onSelectSession: (sessionId: string) => void;
}) {
  return (
    <ChildModalFrame
      title="Switch to another saved session"
      subtitle="Select a saved session to switch to."
      maxWidth="max-w-[590px]"
      onClose={onClose}
    >
      <div className="space-y-3">
        {savedSessions.map((savedSession) => {
          const selected = selectedSessionId === savedSession.id;
          return (
            <button
              key={savedSession.id}
              className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                selected
                  ? 'border-blue-300/55 bg-blue-500/14 shadow-[0_0_0_1px_rgba(96,165,250,0.12)]'
                  : 'border-white/[0.08] bg-white/[0.035] hover:bg-white/[0.065]'
              }`}
              onClick={() => onSelectSession(savedSession.id)}
              type="button"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  selected ? 'border-blue-300 bg-blue-500 text-white' : 'border-mist-500/60'
                }`}
              >
                {selected && <Check size={13} />}
              </span>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-violet-600 text-sm font-bold text-white">
                {savedSession.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-mist-50">{savedSession.accountName}</span>
                <span className="mt-1 block text-sm text-mist-400">{savedSession.email}</span>
              </span>
              <span className="text-right text-sm">
                <span className={savedSession.status === 'Connected' ? 'block font-semibold text-emerald-300' : 'block font-semibold text-amber-300'}>
                  {savedSession.status}
                </span>
                <span className="mt-1 block text-mist-500">Last used: {savedSession.lastUsed}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <ChildButton onClick={onClose}>Cancel</ChildButton>
        <ChildButton
          disabled={!selectedSessionId}
          variant="primary"
          onClick={() => onConfirmSwitch(selectedSessionId)}
        >
          Switch
        </ChildButton>
      </div>
    </ChildModalFrame>
  );
}

function ConfirmSwitchModal({
  targetSession,
  onClose,
  onSwitch,
}: {
  targetSession: SavedSession;
  onClose: () => void;
  onSwitch: () => void;
}) {
  return (
    <ChildModalFrame title="Confirm switch" maxWidth="max-w-[470px]" onClose={onClose}>
      <p className="text-sm leading-6 text-mist-400">
        Switch to this account?
        <br />
        You’ll be signed out from the current session and switched to:
      </p>
      <AccountCard session={targetSession} />
      {operationsRunning && <OperationBlockedWarning />}
      <div className="mt-5 flex justify-end gap-3">
        <ChildButton onClick={onClose}>Cancel</ChildButton>
        <ChildButton disabled={operationsRunning} variant="primary" onClick={onSwitch}>
          Switch account
        </ChildButton>
      </div>
    </ChildModalFrame>
  );
}

function RemoveSessionModal({
  onClose,
  onRemoveSession,
}: {
  onClose: () => void;
  onRemoveSession: () => void;
}) {
  return (
    <ChildModalFrame title="Remove session" maxWidth="max-w-[460px]" onClose={onClose}>
      <h3 className="text-lg font-semibold text-mist-50">Remove this session?</h3>
      <p className="mt-2 text-sm leading-6 text-mist-400">
        {operationsRunning
          ? 'You cannot remove the current session while a task or operation is running.'
          : 'This will remove the current session from this device.'}
      </p>
      {operationsRunning && <OperationBlockedWarning />}
      <div className="mt-5 flex justify-end gap-3">
        <ChildButton onClick={onClose}>Cancel</ChildButton>
        <ChildButton disabled={operationsRunning} variant="danger" onClick={onRemoveSession}>
          Remove session
        </ChildButton>
      </div>
    </ChildModalFrame>
  );
}

function ChildModalFrame({
  title,
  subtitle,
  maxWidth,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  maxWidth: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[115] flex items-center justify-center bg-shell-950/38 px-5 backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <section
        className={`w-full ${maxWidth} rounded-xl border border-white/[0.18] bg-[#071421]/98 p-5 shadow-[0_26px_78px_rgba(0,0,0,0.78),0_0_0_1px_rgba(147,197,253,0.08),0_0_46px_rgba(59,130,246,0.16)] backdrop-blur-xl`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="mb-5 flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold tracking-[-0.02em] text-mist-50">{title}</h2>
            {subtitle && <p className="mt-2 text-sm leading-6 text-mist-400">{subtitle}</p>}
          </div>
          <button
            aria-label={`Close ${title}`}
            className="rounded-lg p-1.5 text-mist-400 transition hover:bg-white/[0.07] hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X size={19} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function OptionCard({
  active,
  Icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  Icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-xl border p-4 text-left transition ${
        active ? 'border-blue-300/60 bg-blue-500/12' : 'border-white/[0.08] bg-white/[0.035] hover:bg-white/[0.065]'
      }`}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg border ${active ? 'border-blue-300/25 bg-blue-500/16 text-blue-200' : 'border-white/[0.08] bg-white/[0.045] text-mist-300'}`}>
          <Icon size={19} />
        </span>
        <span>
          <span className="block font-semibold text-mist-50">{title}</span>
          <span className="mt-1 block text-sm text-mist-400">{description}</span>
        </span>
      </div>
    </button>
  );
}

function LargeActionCard({
  Icon,
  title,
  description,
  destructive = false,
  onClick,
}: {
  Icon: LucideIcon;
  title: string;
  description: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
        destructive
          ? 'border-red-300/16 bg-red-500/[0.055] hover:bg-red-500/[0.09]'
          : 'border-white/[0.08] bg-white/[0.035] hover:bg-white/[0.065]'
      }`}
      onClick={onClick}
      type="button"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
          destructive ? 'border-red-300/18 bg-red-500/12 text-red-200' : 'border-blue-200/14 bg-blue-400/10 text-blue-200'
        }`}
      >
        <Icon size={20} />
      </span>
      <span>
        <span className="block font-semibold text-mist-50">{title}</span>
        <span className="mt-1 block text-sm text-mist-400">{description}</span>
      </span>
    </button>
  );
}

function AccountCard({ session }: { session: SavedSession }) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-violet-600 text-sm font-bold text-white">
        {session.initials}
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-mist-50">{session.accountName}</span>
        <span className="mt-1 flex items-center gap-1.5 text-sm text-mist-400">
          <Mail size={14} />
          {session.email}
        </span>
      </span>
    </div>
  );
}

function OperationBlockedWarning() {
  return (
    <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-300/20 bg-red-500/12 px-3 py-2.5 text-sm font-semibold text-red-100">
      <AlertTriangle size={17} />
      Blocked while operations are running.
    </div>
  );
}

function InlineValidationError({ message }: { message: string }) {
  return (
    <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-300/22 bg-red-500/14 px-3 py-2.5 text-sm font-semibold text-red-100">
      <AlertTriangle size={16} />
      {message}
    </div>
  );
}

function looksLikeYouTubeCookies(value: string) {
  const normalized = value.toLowerCase();
  return (
    normalized.includes('youtube.com') ||
    normalized.includes('.youtube.com') ||
    /\b(sid|hsid|sapisid|ssid|apisid)\b/i.test(value)
  );
}

function ChildButton({
  children,
  disabled = false,
  variant = 'secondary',
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'secondary';
  onClick: () => void;
}) {
  const className = {
    primary: 'border-blue-400/20 bg-blue-600 text-white hover:bg-blue-500',
    danger: 'border-red-300/20 bg-red-500/85 text-white hover:bg-red-400',
    secondary: 'border-white/[0.10] bg-white/[0.045] text-mist-200 hover:bg-white/[0.08]',
  }[variant];

  return (
    <button
      className={`h-10 rounded-lg border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

const connectedHealthItems = [
  'Session data loaded',
  'Sign-in check passed',
  'Playlist access check passed',
];

const disconnectedHealthItems = [
  'Session data not loaded',
  'Sign-in check unavailable',
  'Playlist access check unavailable',
];

type Tone = 'green' | 'blue' | 'amber' | 'muted';

function InfoCard({
  Icon,
  tone,
  title,
  value,
  description,
}: {
  Icon: LucideIcon;
  tone: Tone;
  title: string;
  value: string;
  description: string;
}) {
  const toneClass = {
    green: 'text-emerald-200 bg-emerald-400/[0.10] border-emerald-300/15',
    blue: 'text-blue-200 bg-blue-400/[0.10] border-blue-300/15',
    amber: 'text-amber-200 bg-amber-400/[0.10] border-amber-300/15',
    muted: 'text-mist-400 bg-white/[0.045] border-white/[0.08]',
  }[tone];

  return (
    <div className="rounded-xl border border-white/[0.08] bg-shell-950/30 p-4">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${toneClass}`}>
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-mist-400">{title}</p>
          <h4 className="mt-1 text-base font-semibold text-mist-50">{value}</h4>
          <p className="mt-1 text-sm leading-5 text-mist-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

function SessionActionButton({
  Icon,
  label,
  destructive = false,
  onClick,
}: {
  Icon: LucideIcon;
  label: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition ${
        destructive
          ? 'border-red-300/20 bg-red-500/15 text-red-100 hover:bg-red-500/24'
          : 'border-white/[0.10] bg-white/[0.045] text-mist-100 hover:bg-white/[0.08]'
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon size={17} />
      {label}
    </button>
  );
}
