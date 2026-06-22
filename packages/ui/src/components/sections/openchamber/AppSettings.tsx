import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n, type Locale } from '@/lib/i18n';
import { useUIStore } from '@/stores/useUIStore';
import { updateDesktopSettings } from '@/lib/persistence';
import { AboutAppSettings } from './AboutAppSettings';
import { Icon } from '@/components/icon/Icon';
import { copyTextToClipboard } from '@/lib/clipboard';
import { runtimeFetch } from '@/lib/runtime-fetch';

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

// Section Header component
interface SectionHeaderProps {
  icon: string;
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title }) => (
  <div className="flex items-center gap-2 pb-2 mb-4 border-b" style={{ borderBottomColor: 'rgba(255, 255, 255, 0.1)' }}>
    <Icon name={icon as any} className="h-4 w-4 text-muted-foreground/70" />
    <h3 className="typography-micro font-semibold text-muted-foreground/60 uppercase tracking-wider">
      {title}
    </h3>
  </div>
);

// Setting Row component
interface SettingRowProps {
  children: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ children }) => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:gap-4 items-center">
    {children}
  </div>
);

// URL Display with Copy component
interface URLDisplayProps {
  url: string;
}

const URLDisplay: React.FC<URLDisplayProps> = ({ url }) => {
  const { t } = useI18n();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await copyTextToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <code className="typography-micro bg-[var(--surface-subtle)] px-2 py-1 rounded text-muted-foreground">
        {url}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={t('Copy URL')}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-interactive-hover/50 transition-colors"
        title={t('Copy URL')}
      >
        <Icon name={copied ? 'check' : 'clipboard'} className="h-4 w-4" />
      </button>
    </div>
  );
};

// Card component
interface CardProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children }) => (
  <div className="rounded-xl bg-[var(--surface-elevated)] border border-border/20 shadow-sm p-5">
    {children}
  </div>
);

export const AppSettings: React.FC = () => {
  const { t } = useI18n();
  const [branch, setBranch] = React.useState<Branch>(getStoredBranch);

  const handleBranchChange = (value: string) => {
    if (value === 'original' || value === 'modified') {
      setBranch(value);
      void saveBranch(value);
    }
  };

  // Localization
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
    <div className="space-y-5">
      <div>
        <h3 className="typography-ui-header font-semibold text-foreground">
          {t('settings.page.app.title')}
        </h3>
      </div>

      {/* REPOSITORY CARD */}
      <Card>
        <SectionHeader icon="github" title={t('settings.app.repository.title') || 'Repository'} />
        
        <div className="space-y-4">
          <SettingRow>
            <div>
              <label className="typography-ui-label block text-foreground">
                {t('settings.app.updateBranch.label')}
              </label>
              <span className="typography-meta text-muted-foreground">
                {t('settings.app.updateBranch.description')}
              </span>
            </div>
            <div className="md:justify-self-end">
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
          </SettingRow>

          <div className="border-t pt-4" style={{ borderTopColor: 'rgba(255, 255, 255, 0.1)' }}>
            <label className="typography-ui-label block mb-2 text-foreground">
              {t('settings.app.repository.url') || 'Repository URL'}
            </label>
            <URLDisplay url={CONFIG_BRANCH_URLS[branch]} />
          </div>
        </div>
      </Card>

      {/* LOCALIZATION CARD */}
      <Card>
        <SectionHeader icon="earth" title={t('settings.openchamber.visual.section.localization') || 'Localization & Regional'} />
        
        <div className="space-y-4">
          <SettingRow>
            <div>
              <label className="typography-ui-label block text-foreground">
                {t('settings.appearance.language.label')}
              </label>
              <span className="typography-meta text-muted-foreground">
                {t('settings.appearance.language.description')}
              </span>
            </div>
            <div className="md:justify-self-end">
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
          </SettingRow>

          <div className="border-t pt-4 space-y-4" style={{ borderTopColor: 'rgba(255, 255, 255, 0.1)' }}>
            <SettingRow>
              <div>
                <label className="typography-ui-label block text-foreground">
                  {t('settings.openchamber.visual.field.timeFormat')}
                </label>
                <span className="typography-meta text-muted-foreground">
                  {t('settings.openchamber.visual.field.timeFormatDescription') || 'How times are displayed'}
                </span>
              </div>
              <div className="md:justify-self-end">
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
            </SettingRow>

            <SettingRow>
              <div>
                <label className="typography-ui-label block text-foreground">
                  {t('settings.openchamber.visual.field.weekStartsOn')}
                </label>
                <span className="typography-meta text-muted-foreground">
                  {t('settings.openchamber.visual.field.weekStartsOnDescription') || 'First day of the week in calendars'}
                </span>
              </div>
              <div className="md:justify-self-end">
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
            </SettingRow>
          </div>
        </div>
      </Card>

      {/* ABOUT CARD */}
      <Card>
        <SectionHeader icon="information" title={t('settings.page.about.title') || 'About'} />
        
        <div className="space-y-4">
          <AboutAppSettings />
        </div>
      </Card>
    </div>
  );
};
