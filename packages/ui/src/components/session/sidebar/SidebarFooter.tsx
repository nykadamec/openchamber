import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Icon } from "@/components/icon/Icon";
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type Props = {
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  onOpenAbout: () => void;
  onOpenUpdate: () => void;
  onCheckForUpdates: () => void;
  showRuntimeButtons?: boolean;
  showUpdateButton?: boolean;
  updateAvailable: boolean;
  appVersion: string;
  checking: boolean;
};

const footerButtonClassName = cn(
  'inline-flex h-7 w-7 items-center justify-center rounded-md',
  'text-muted-foreground/70',
  'hover:bg-interactive-hover/60 hover:text-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
  'transition-colors',
);

export function SidebarFooter({
  onOpenSettings,
  onOpenShortcuts,
  onOpenAbout,
  onOpenUpdate,
  onCheckForUpdates,
  showRuntimeButtons = true,
  showUpdateButton = true,
  updateAvailable,
  appVersion,
  checking,
}: Props): React.ReactNode {
  const { t } = useI18n();

  return (
    <div className="flex shrink-0 items-center justify-start gap-0.5 border-t border-border/40 px-2 py-1.5">
      {showRuntimeButtons ? (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onOpenSettings} className={footerButtonClassName} aria-label={t('sessions.sidebar.footer.actions.settings')}>
                <Icon name="settings-3" className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={4}><p>{t('sessions.sidebar.footer.actions.settings')}</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onOpenShortcuts} className={footerButtonClassName} aria-label={t('sessions.sidebar.footer.actions.shortcuts')}>
                <Icon name="question" className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={4}><p>{t('sessions.sidebar.footer.actions.shortcuts')}</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onOpenAbout} className={footerButtonClassName} aria-label={t('sessions.sidebar.footer.actions.aboutOpenChamber')}>
                <Icon name="information" className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={4}><p>{t('sessions.sidebar.footer.actions.aboutOpenChamber')}</p></TooltipContent>
          </Tooltip>
        </>
      ) : null}
      {showUpdateButton ? (
        updateAvailable ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="default"
                size="xs"
                className="ml-auto h-6 gap-1 border border-[var(--status-info-border)] bg-[var(--status-info-background)] px-2 text-[11px] font-medium leading-none tracking-[0.01em] text-[var(--status-info)] hover:bg-[var(--status-info-background)]/80 hover:text-[var(--status-info)]"
                onClick={onOpenUpdate}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 inline-flex animate-ping rounded-full bg-[var(--status-info)] opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--status-info)]" />
                </span>
                {t('sessions.sidebar.footer.actions.update')}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={4}><p>{t('sessions.sidebar.footer.actions.update')}</p></TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onCheckForUpdates}
                disabled={checking}
                aria-label={t('sessions.sidebar.footer.versionTooltip')}
                className={cn(
                  'group/version ml-auto inline-flex h-6 items-center gap-1 rounded-md px-2',
                  'text-[11px] font-medium leading-none tracking-[0.01em]',
                  'text-muted-foreground/60 hover:text-foreground/90',
                  'transition-colors duration-150 ease-out',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                  'disabled:cursor-progress disabled:opacity-90',
                  'font-mono tabular-nums',
                )}
              >
                {checking ? (
                  <Icon name="loader-4" className="size-3 animate-spin text-muted-foreground/60" />
                ) : (
                  <span
                    aria-hidden="true"
                    className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/50 motion-reduce:animate-none"
                  />
                )}
                <span className="relative">
                  v{appVersion}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current opacity-0 transition-[transform,opacity] duration-150 ease-out group-hover/version:scale-x-100 group-hover/version:opacity-70 group-focus-visible/version:scale-x-100 group-focus-visible/version:opacity-70 motion-reduce:transition-none"
                  />
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={4}><p>{t('sessions.sidebar.footer.versionTooltip')}</p></TooltipContent>
          </Tooltip>
        )
      ) : null}
    </div>
  );
}
