import React from 'react';
import { useUpdateStore } from '@/stores/useUpdateStore';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon/Icon';
import { useI18n } from '@/lib/i18n';
import { runtimeFetch } from '@/lib/runtime-fetch';
import { UpdateDialog } from '@/components/ui/UpdateDialog';
import { useDeviceInfo } from '@/lib/device';
import { OpenChamberLogo } from '@/components/ui/OpenChamberLogo';

const GITHUB_URL = 'https://github.com/openchamber/openchamber';
const GITHUB_MOD_URL = 'https://github.com/nykadamec/openchamber';
const DISCORD_URL = 'https://discord.gg/ZYRSdnwwKA';
const X_URL = 'https://x.com/openchamber_dev';

const MIN_CHECKING_DURATION = 800;

export const AboutAppSettings: React.FC = () => {
  const { t } = useI18n();
  const { isMobile } = useDeviceInfo();
  const [openChamberVersion, setOpenChamberVersion] = React.useState<string | null>(null);
  const [openCodeVersion, setOpenCodeVersion] = React.useState<string | null>(null);
  const [isChecking, setIsChecking] = React.useState(false);

  const updateStore = useUpdateStore(useShallow((s) => ({
    info: s.info,
    checking: s.checking,
    available: s.available,
    error: s.error,
    downloading: s.downloading,
    downloaded: s.downloaded,
    progress: s.progress,
    runtimeType: s.runtimeType,
    checkForUpdates: s.checkForUpdates,
    downloadUpdate: s.downloadUpdate,
    restartToUpdate: s.restartToUpdate,
  })));

  const [updateDialogOpen, setUpdateDialogOpen] = React.useState(false);
  const didInitiateCheck = React.useRef(false);

  React.useEffect(() => {
    let cancelled = false;
    const loadVersions = async () => {
      try {
        const ocResponse = await runtimeFetch('/api/system/info', {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        if (ocResponse.ok) {
          const data = await ocResponse.json().catch(() => null) as { openchamberVersion?: unknown } | null;
          const version = typeof data?.openchamberVersion === 'string' && data.openchamberVersion.trim().length > 0
            ? data.openchamberVersion.trim()
            : null;
          if (!cancelled) setOpenChamberVersion(version);
        }
        const opResponse = await runtimeFetch('/api/opencode/upgrade-status', {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        if (opResponse.ok) {
          const data = await opResponse.json().catch(() => null) as { currentVersion?: unknown } | null;
          const version = typeof data?.currentVersion === 'string' && data.currentVersion.trim().length > 0
            ? data.currentVersion.trim()
            : null;
          if (!cancelled) setOpenCodeVersion(version);
        }
      } catch {
        if (!cancelled) {
          setOpenChamberVersion(null);
          setOpenCodeVersion(null);
        }
      }
    };
    void loadVersions();
    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    if (updateStore.checking) {
      setIsChecking(true);
      didInitiateCheck.current = true;
    } else if (isChecking) {
      const timer = setTimeout(() => {
        setIsChecking(false);
        if (didInitiateCheck.current && !updateStore.available && !updateStore.error) {
          didInitiateCheck.current = false;
        }
      }, MIN_CHECKING_DURATION);
      return () => clearTimeout(timer);
    }
  }, [updateStore.checking, isChecking, updateStore.available, updateStore.error]);

  const currentOpenChamberVersion = openChamberVersion || updateStore.info?.currentVersion || t('settings.openchamber.about.state.unknown');
  const currentOpenCodeVersion = openCodeVersion || updateStore.info?.version || t('settings.openchamber.about.state.unknown');
  const isCheckingUpdates = updateStore.checking || isChecking;

  if (isMobile) {
    return (
      <div className="w-full space-y-6 pb-2">
        <div className="flex flex-col items-center text-center">
          <OpenChamberLogo width={72} height={72} />
          <div className="mt-2 space-y-1 typography-ui text-muted-foreground">
            <p>{t('aboutDialog.openChamberVersionLabel', { version: currentOpenChamberVersion })}</p>
            <p>{t('aboutDialog.openCodeVersionLabel', { version: currentOpenCodeVersion || t('settings.openchamber.about.state.unknown') })}</p>
          </div>
        </div>
        <div className="flex justify-center">
          {!updateStore.available && !updateStore.error && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => updateStore.checkForUpdates()}
              disabled={isCheckingUpdates}
              className="h-10 w-auto justify-center gap-2 rounded-xl px-4"
            >
              {isCheckingUpdates ? <Icon name="loader-4" className="size-4 animate-spin" /> : <Icon name="refresh" className="size-4" />}
              {isCheckingUpdates ? t('settings.openchamber.about.state.checking') : t('settings.openchamber.about.actions.checkForUpdates')}
            </Button>
          )}
          {!isCheckingUpdates && updateStore.available && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setUpdateDialogOpen(true)}
              className="h-10 w-auto justify-center gap-2 rounded-xl px-4"
            >
              <Icon name="download" className="size-4" />
              {t('settings.openchamber.about.actions.updateToVersion', { version: updateStore.info?.version || '' })}
            </Button>
          )}
        </div>
        {updateStore.error && (
          <p className="rounded-xl border border-[var(--status-error-border)] bg-[var(--status-error-background)] px-3 py-2 typography-meta text-[var(--status-error)]">
            {updateStore.error}
          </p>
        )}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center gap-5">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 typography-ui-label text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon name="github-fill" className="size-5" />
              <span>GitHub</span>
            </a>
            <a
              href={GITHUB_MOD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 typography-ui-label text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon name="github-fill" className="size-5" />
              <span>Fork (nyk)</span>
            </a>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 typography-ui-label text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon name="discord-fill" className="size-5" />
              <span>Discord</span>
            </a>
          </div>
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 typography-ui-label text-muted-foreground transition-colors hover:text-foreground"
          >
            <Icon name="twitter-xfill" className="size-5" />
            <span>@openchamber_dev</span>
          </a>
        </div>
        <p className="text-center typography-ui text-muted-foreground/60">
          {t('aboutDialog.footerNote')}
        </p>
        <UpdateDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          info={updateStore.info}
          downloading={updateStore.downloading}
          downloaded={updateStore.downloaded}
          progress={updateStore.progress}
          error={updateStore.error}
          onDownload={updateStore.downloadUpdate}
          onRestart={updateStore.restartToUpdate}
          runtimeType={updateStore.runtimeType}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with logo and version */}
      <div className="rounded-lg bg-[var(--surface-elevated)]/70 overflow-hidden border border-[var(--surface-subtle)]">
        <div className="flex flex-col items-center gap-3 px-4 py-6">
          <OpenChamberLogo width={48} height={48} />
          <div className="text-center">
            <h3 className="typography-ui-header font-semibold text-foreground">
              {t('settings.openchamber.about.title')}
            </h3>
            <p className="typography-meta text-muted-foreground">
              {t('settings.openchamber.about.field.version')} {currentOpenChamberVersion} • 
              {t('settings.openchamber.about.field.openCodeVersion')} {currentOpenCodeVersion}
            </p>
          </div>
        </div>
      </div>

      {/* Version details card */}
      <div className="rounded-lg bg-[var(--surface-elevated)]/70 overflow-hidden border border-[var(--surface-subtle)]">
        <div className="grid grid-cols-2 gap-4 px-4 py-3">
          <div className="flex min-w-0 flex-col">
            <span className="typography-ui-label text-muted-foreground">
              {t('settings.openchamber.about.field.version')}
            </span>
            <span className="typography-meta text-foreground font-mono">
              {currentOpenChamberVersion}
            </span>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="typography-ui-label text-muted-foreground">
              {t('settings.openchamber.about.field.openCodeVersion')}
            </span>
            <span className="typography-meta text-foreground font-mono">
              {currentOpenCodeVersion}
            </span>
          </div>
        </div>
      </div>

      {/* Update check */}
      <div className="flex items-center justify-end gap-3 px-1">
        {isCheckingUpdates && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon name="loader-4" className="size-4 animate-spin" />
            <span className="typography-meta">{t('settings.openchamber.about.state.checking')}</span>
          </div>
        )}
        {!isCheckingUpdates && updateStore.available && (
          <Button
            size="sm"
            variant="default"
            onClick={() => setUpdateDialogOpen(true)}
            className="h-8"
          >
            <Icon name="download" className="size-4 mr-1" />
            {t('settings.openchamber.about.actions.updateToVersion', {
              version: updateStore.info?.version || ''
            })}
          </Button>
        )}
        {!isCheckingUpdates && !updateStore.available && !updateStore.error && (
          <span className="typography-meta text-muted-foreground">
            {t('settings.openchamber.about.state.upToDate')}
          </span>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateStore.checkForUpdates()}
          disabled={isCheckingUpdates}
          className="h-8"
        >
          {t('settings.openchamber.about.actions.checkForUpdates')}
        </Button>
      </div>
      {updateStore.error && (
        <div className="px-3 py-2 rounded-lg bg-[var(--status-error-background)] border border-[var(--status-error-border)]">
          <p className="typography-meta text-[var(--status-error)]">{updateStore.error}</p>
        </div>
      )}

      {/* Community links grid */}
      <div className="rounded-lg bg-[var(--surface-elevated)]/70 overflow-hidden border border-[var(--surface-subtle)]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 py-3">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:bg-[var(--interactive-hover)]/10 p-2 rounded transition-colors"
          >
            <Icon name="github-fill" className="size-4" />
            <span className="typography-meta text-foreground">GitHub</span>
          </a>
          <a
            href={GITHUB_MOD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:bg-[var(--interactive-hover)]/10 p-2 rounded transition-colors"
          >
            <Icon name="github-fill" className="size-4" />
            <span className="typography-meta text-foreground">Fork</span>
          </a>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:bg-[var(--interactive-hover)]/10 p-2 rounded transition-colors"
          >
            <Icon name="discord-fill" className="size-4" />
            <span className="typography-meta text-foreground">Discord</span>
          </a>
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:bg-[var(--interactive-hover)]/10 p-2 rounded transition-colors"
          >
            <Icon name="twitter-xfill" className="size-4" />
            <span className="typography-meta text-foreground">@openchamber_dev</span>
          </a>
        </div>
      </div>

      <UpdateDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        info={updateStore.info}
        downloading={updateStore.downloading}
        downloaded={updateStore.downloaded}
        progress={updateStore.progress}
        error={updateStore.error}
        onDownload={updateStore.downloadUpdate}
        onRestart={updateStore.restartToUpdate}
        runtimeType={updateStore.runtimeType}
      />
    </div>
  );
};
