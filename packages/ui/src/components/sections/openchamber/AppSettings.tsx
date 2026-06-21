import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';
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

export const AppSettings: React.FC = () => {
  const { t } = useI18n();
  const [branch, setBranch] = React.useState<Branch>(getStoredBranch);

  const handleBranchChange = (value: string) => {
    if (value === 'original' || value === 'modified') {
      setBranch(value);
      void saveBranch(value);
    }
  };

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
    </div>
  );
};
