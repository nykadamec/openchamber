# Plán: `stop:web` script + změna portu na 4488

## Cíl
1. Přidat npm/bun script `stop:web`, který killne běžící webserver.
2. Změnit výchozí port webserveru z `3001` na `4488` (v relevantních scriptech + kill scriptu).

## Kontext
- Server běží na portu z `OPENCHAMBER_PORT` env, default `3001` (viz `packages/web/package.json`).
- `start:web` v root `package.json` (`bun run --cwd packages/web start`) se **nemění** (rozhodnutí uživatele).
- `vite.config.ts` obsahuje `process.env.OPENCHAMBER_PORT || 3001` pro proxy target — **mimo scope** této změny (uživatel explicitně řekl „jenom změnit hodnotu na package - web").

## Soubory ke změně
1. **`scripts/kill-web.mjs`** (nový) — Node script pro cross-platform kill (SIGTERM + 3s timeout → SIGKILL).
2. **`package.json`** (root) — přidat `"stop:web": "node ./scripts/kill-web.mjs"`.
3. **`packages/web/package.json`** — změnit fallback `:${OPENCHAMBER_PORT:-3001}` → `:${OPENCHAMBER_PORT:-4488}` ve scriptech `dev:server` a `dev:server:watch`.
4. **`scripts/kill-web.mjs`** — default port `'3001'` → `'4488'`.

## Rozhodnutí (schváleno)
- ✅ Přidat **jen do root `package.json`**
- ✅ Cross-platform Node script (macOS/Linux/Windows)
- ✅ Název: `stop:web`
- ✅ Port: `OPENCHAMBER_PORT` env, default `4488`
- ✅ Signál: **SIGTERM + 3s timeout → SIGKILL** (Windows: rovnou taskkill /F)
- ✅ Detekce: `lsof` (macOS/Linux) / `netstat + taskkill` (Windows)
- ✅ Node script umístěn v `scripts/kill-web.mjs`
- 🆕 ✅ `start:web` v rootu: přidat `--port 4488` (po update na základě testu — CLI default 3000 se nemění)

## Implementační kroky
1. ✅ Vytvořit `scripts/kill-web.mjs` s implementovanou logikou (hotovo).
2. ✅ Přidat `stop:web` do root `package.json` (hotovo).
3. ✅ Otestovat na běžícím serveru (hotovo — kill na PID 78859 proběhl graceful).
4. 🆕 Změnit fallback portu `3001` → `4488` v `packages/web/package.json` (řádky 16–17).
5. 🆕 Změnit default port `'3001'` → `'4488'` v `scripts/kill-web.mjs`.
6. ⏳ Ověřit `bun run type-check` a `bun run lint` (baseline green).

## Použití po změně
```
bun run stop:web                       # killne process na portu 4488
OPENCHAMBER_PORT=9000 bun run stop:web # killne process na portu 9000
bun run dev:web:server                 # server nyní startuje na 4488
OPENCHAMBER_PORT=9000 bun run dev:web:server
```

## Status
✅ Hotovo. type-check a lint prošly (baseline green). E2E test na portu 4488 proběhl úspěšně (start → SIGTERM → graceful stop).

## Shrnutí změn
| Soubor | Změna |
|---|---|
| `scripts/kill-web.mjs` | nový — cross-platform kill script (SIGTERM + 3s → SIGKILL) |
| `package.json` (root) | přidán `"stop:web": "node ./scripts/kill-web.mjs"` |
| `packages/web/package.json` | `OPENCHAMBER_PORT:-3001` → `OPENCHAMBER_PORT:-4488` (řádky 16–17) |
| `scripts/kill-web.mjs` | default port `'3001'` → `'4488'` (řádek 5) |
| `package.json` (root) | `start:web` doplněn o `-- --port 4488` |
| `packages/ui/src/components/session/sidebar/SidebarFooter.tsx` | verze v sidebaru: `text-[11px]` → `text-[10px]` |
