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
          <Button
            type="button"
            variant="default"
            size="xs"
            className="ml-auto border-[var(--status-info-border)] bg-[var(--status-info-background)] text-[var(--status-info)] hover:bg-[var(--status-info-background)]/80 hover:text-[var(--status-info)] dark:border-[var(--status-info-border)] dark:bg-[var(--status-info-background)] dark:hover:bg-[var(--status-info-background)]/80"
            onClick={onOpenUpdate}
          >
            {t('sessions.sidebar.footer.actions.update')}
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="ml-auto gap-1 font-mono text-muted-foreground/70 tabular-nums hover:text-foreground"
                onClick={onCheckForUpdates}
                disabled={checking}
                aria-label={t('sessions.sidebar.footer.versionTooltip')}
              >
                {checking ? <Icon name="loader-4" className="size-3 animate-spin" /> : null}
                v{appVersion}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={4}><p>{t('sessions.sidebar.footer.versionTooltip')}</p></TooltipContent>
          </Tooltip>
        )
      ) : null}
    </div>
  );
}
