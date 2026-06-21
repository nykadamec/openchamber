import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n, type Locale } from '@/lib/i18n';
import { useUIStore } from '@/stores/useUIStore';
import { updateDesktopSettings } from '@/lib/persistence';
import { AboutAppSettings } from './AboutAppSettings';

const STORAGE_KEY = 'openchamber-update-branch';

const CONFIG_BRANCH_URLS = {
  original: 'https://github.com/openchamber/openchamber',
  modified: 'https://github.com/nykadamec/openchamber',
} as const;

type Branch = 'original' | 'modified';

function getStoredBranch(): Branch {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'original' || stored === 'modified') return stored;
  } catch {
    // localStorage may be unavailable
  }
  return 'original';
}

async function saveBranch(branch: Branch): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY, branch);
    await runtimeFetch('/api/openchamber/update-branch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch }),
    });
  } catch (error) {
    console.warn('Failed to save update branch:', error);
  }
}

const TIME_FORMAT_OPTIONS = [
  { id: 'auto' as const, labelKey: 'settings.openchamber.visual.option.timeFormat.auto.label' },
  { id: '24h' as const, labelKey: 'settings.openchamber.visual.option.timeFormat.24h.label' },
  { id: '12h' as const, labelKey: 'settings.openchamber.visual.option.timeFormat.12h.label' },
];

const WEEK_START_OPTIONS = [
  { id: 'auto' as const, labelKey: 'settings.openchamber.visual.option.weekStart.auto.label' },
  { id: 'monday' as const, labelKey: 'settings.openchamber.visual.option.weekStart.monday.label' },
  { id: 'sunday' as const, labelKey: 'settings.openchamber.visual.option.weekStart.sunday.label' },
];

export const AppSettings: React.FC = () => {
  const { t } = useI18n();
  const [branch, setBranch] = React.useState<Branch>(getStoredBranch);

  const handleBranchChange = (value: string) => {
    if (value === 'original' || value === 'modified') {
      setBranch(value);
      void saveBranch(value);
    }
  };

  // === LOKALIZACE ===
  const { locale, locales, setLocale, label } = useI18n();
  const tUnsafe = React.useCallback((key: string) => t(key as Parameters<typeof t>[0]), [t]);
  
  const timeFormatPreference = useUIStore(state => state.timeFormatPreference);
  const setTimeFormatPreference = useUIStore(state => state.setTimeFormatPreference);
  const weekStartPreference = useUIStore(state => state.weekStartPreference);
  const setWeekStartPreference = useUIStore(state => state.setWeekStartPreference);

  const handleTimeFormatPreferenceChange = React.useCallback((value: 'auto' | '12h' | '24h') => {
    setTimeFormatPreference(value);
    void updateDesktopSettings({ timeFormatPreference: value });
  }, [setTimeFormatPreference]);

  const handleWeekStartPreferenceChange = React.useCallback((value: 'auto' | 'monday' | 'sunday') => {
    setWeekStartPreference(value);
    void updateDesktopSettings({ weekStartPreference: value });
  }, [setWeekStartPreference]);

  const selectedTimeFormatLabel = React.useMemo(() => {
    const option = TIME_FORMAT_OPTIONS.find((item) => item.id === timeFormatPreference);
    return tUnsafe(option?.labelKey ?? 'settings.openchamber.visual.option.timeFormat.auto.label');
  }, [timeFormatPreference, tUnsafe]);

  const selectedWeekStartLabel = React.useMemo(() => {
    const option = WEEK_START_OPTIONS.find((item) => item.id === weekStartPreference);
    return tUnsafe(option?.labelKey ?? 'settings.openchamber.visual.option.weekStart.auto.label');
  }, [weekStartPreference, tUnsafe]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="typography-ui-header font-semibold text-foreground">
          {t('settings.page.app.title')}
        </h3>
      </div>
      <div className="rounded-lg bg-[var(--surface-elevated)]/70 overflow-hidden">
        <div
          data-settings-item="app.update-branch"
          className="grid grid-cols-1 gap-2 p-4 md:grid-cols-[14rem_auto] md:gap-x-8 md:gap-y-2"
        >
          <div className="flex min-w-0 flex-col">
            <span className="typography-ui-label text-foreground shrink-0">
              {t('settings.app.updateBranch.label')}
            </span>
            <span className="typography-meta text-muted-foreground">
              {t('settings.app.updateBranch.description')}
            </span>
          </div>
          <Select value={branch} onValueChange={handleBranchChange}>
            <SelectTrigger
              aria-label={t('settings.app.updateBranch.select')}
              className="w-fit"
            >
              <SelectValue>
                {branch === 'original'
                  ? 'Original Branch'
                  : 'Modified Branch (nykadamec)'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="original">Original Branch</SelectItem>
              <SelectItem value="modified">Modified Branch (nykadamec)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="border-t border-[var(--surface-subtle)] px-4 py-3">
          <span className="typography-meta text-muted-foreground">
            {CONFIG_BRANCH_URLS[branch]}
          </span>
        </div>
      </div>

      <div className="rounded-lg bg-[var(--surface-elevated)]/70 overflow-hidden">
        <div className="p-4 space-y-4">
          <h4 className="typography-ui-header font-medium text-foreground">
            {t('settings.openchamber.visual.section.localization')}
          </h4>
          <div data-settings-item="app.language" className="grid grid-cols-1 gap-2 md:grid-cols-[14rem_auto] md:gap-x-8 md:gap-y-2">
            <div className="flex min-w-0 flex-col">
              <span className="typography-ui-label text-foreground shrink-0">{t('settings.appearance.language.label')}</span>
              <span className="typography-meta text-muted-foreground">{t('settings.appearance.language.description')}</span>
            </div>
            <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
              <SelectTrigger aria-label={t('settings.appearance.language.select')} className="w-fit">
                <SelectValue>{label(locale)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {locales.map((availableLocale) => (
                  <SelectItem key={availableLocale} value={availableLocale}>
                    {label(availableLocale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[14rem_auto] md:gap-x-8 md:gap-y-2">
            <div data-settings-item="app.time-format" className="flex min-w-0 items-center gap-2">
              <span className="typography-ui-label text-foreground shrink-0">{t('settings.openchamber.visual.field.timeFormat')}</span>
              <Select value={timeFormatPreference} onValueChange={handleTimeFormatPreferenceChange}>
                <SelectTrigger aria-label={t('settings.openchamber.visual.field.selectTimeFormatAria')} className="w-fit">
                  <SelectValue>{selectedTimeFormatLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TIME_FORMAT_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>{tUnsafe(option.labelKey)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div data-settings-item="app.week-start" className="flex min-w-0 items-center gap-2">
              <span className="typography-ui-label text-foreground shrink-0">{t('settings.openchamber.visual.field.weekStartsOn')}</span>
              <Select value={weekStartPreference} onValueChange={handleWeekStartPreferenceChange}>
                <SelectTrigger aria-label={t('settings.openchamber.visual.field.selectWeekStartAria')} className="w-fit">
                  <SelectValue>{selectedWeekStartLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {WEEK_START_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>{tUnsafe(option.labelKey)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <AboutAppSettings />
    </div>
  );
};
