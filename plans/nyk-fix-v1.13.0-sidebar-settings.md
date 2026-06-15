# Plán: Oprava nastavení experimentálního sidebaru

**Branch:** `nyk/fix/v1.13.0_sidebar_settings`  
**Vychází z:** `feat/v1.13.0`  
**Cíl:** Přidat do nastavení experimentální přepínač, který okamžitě přepíná mezi stávajícím oficiálním sidebar a novým minimalistickým zobrazením projektů ve formě karet. Defaultně bude vypnuto.

## Požadavky od vlastníka

1. Sekce v nastavení: **Visual → Interface**.
2. Změna se projeví **okamžitě**.
3. Design nového seznamu: **varianta B – karty projektů**.
4. DND a kontextová menu musí zůstat plně funkční.
5. Automaticky rozbalit aktivní projekt – ponecháno na implementaci.
6. **Nezasahovat do** headeru, search baru ani footeru.

## Kroky implementace

### 1. Příprava větve
- Založit `nyk/fix/v1.13.0_sidebar_settings` z aktuální `feat/v1.13.0`.

### 2. Stavový management (`packages/ui/src/stores/useUIStore.ts`)
- Přidat `experimentalSidebar: boolean` do typu store.
- Defaultní hodnota: `false`.
- Přidat setter `setExperimentalSidebar`.
- Přidat `experimentalSidebar` do persistovaného stavu (localStorage).

### 3. Přepínač v nastavení (`packages/ui/src/components/sections/openchamber/OpenChamberVisualSettings.tsx`)
- Rozšířit `VisibleSetting` typ o `'experimentalSidebar'`.
- Přidat checkbox do sekce **Visual → Interface** vedle `stickyUserHeader` a dalších.
- Použít existující i18n klíče:
  - `settings.openchamber.visual.field.experimentalSidebar`
  - `settings.openchamber.visual.field.experimentalSidebarAria`
  - `settings.openchamber.visual.field.experimentalSidebarTooltip`

### 4. Vyhledávatelnost v nastavení (`packages/ui/src/lib/settings/search.ts`)
- Přidat search záznam pro `experimentalSidebar`, aby se přepínač našel při hledání.

### 5. Nová komponenta karet projektů
- Vytvořit `packages/ui/src/components/session/sidebar/MinimalProjectsList.tsx`.
- Design varianta **B**:
  - Každý projekt jako samostatná karta s jemným okrajem/stínem.
  - Header karty: ikona projektu, název, tlačítka pro novou session a menu.
  - Tělo karty: kompaktní seznam sessionů/skupin v daném projektu.
  - Aktivní projekt vizuálně zvýrazněn.
  - Automaticky rozbalen aktivní projekt.
- Zachovat všechny interakce:
  - DND řazení projektů.
  - Collapse/expand projektu.
  - Výběr session, nová session, menu.
  - Kontextová menu a další akce.
- Nepoužívat toto nové zobrazení pro `sharedSessionsOnly` a prázdné stavy, pokud by to bylo konfliktní.

### 6. Zapojení podmíněného vykreslení
- V `SessionSidebar.tsx` (nebo `SidebarProjectsList.tsx`) číst `experimentalSidebar` z `useUIStore`.
- Pokud `true`, vykreslit `MinimalProjectsList`.
- Pokud `false`, ponechat stávající `SidebarProjectsList`.
- Header, search bar a footer zůstávají nedotčeny.

### 7. Ověření
- Spustit `bun run type-check`.
- Spustit `bun run lint`.
- Ručně ověřit:
  - Defaultně je oficiální sidebar.
  - Přepnutím v nastavení se okamžitě změní na karty.
  - Po vypnutí se vrátí původní zobrazení.
  - DND, menu, search, footer a header fungují ve obou režimech.

### 8. Dokumentace
- Přidat záznam do `CHANGELOG.md`.

## Sdílené typy

`ProjectSection` a `SessionGroup` jsou definovány v `SidebarProjectsList.tsx` a budou exportovány/sdíleny s `MinimalProjectsList.tsx`.

## Povinné skills před editací

- `settings-ui-patterns` pro změny v nastavení.
- `theme-system` pro UI změny.
- `locale-ui-patterns` pro práci s lokalizací.
