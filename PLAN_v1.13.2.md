# Plán implementace v1.13.1 + v1.13.2

## Přehled

Implementace upstream změn z OpenChamber v1.13.1 a v1.13.2 do tohoto fork (aktuální v1.13.0) pomocí strategie cherry-pick.

### Fork úpravy (3 commity)

Fork má tři vlastní commity, které upravují:
- **Chat input** (glassmorphism redesign) — `ChatInput.tsx`, `ModelControls.tsx`, `PendingChangesBar.tsx`
- **Sidebar** (experimental card layout) — `MinimalProjectsList.tsx`, `SidebarProjectsList.tsx`, `sizableItems.tsx`
- **Theme/CSS** — `index.css`, `cssGenerator.ts`, `design-system.css`
- **UI store** — `useUIStore.ts`, `useSessionDisplayStore.ts`
- **i18n** — `cs.ts`, `cs.settings.ts`, `intl.ts`

### Upstream commity mezi v1.13.0 → v1.13.2

Celkem **38 upstream commitů** (včetně 2 release commitů, které přeskočíme).

## Fáze 1: Bezkonfliktní cherry-picky (14 commitů)

Tyto commity nemění soubory, které fork upravil. Lze je cherry-picknout bez rizika.

| Hash | Popisek | Důvod |
|------|--------|--------|
| `1c87e55f` | Oprava matematických delimiterů ($50) | Chat markdown |
| `2c3f4e14` | Mermaid fullscreen náhled | Chat feature |
| `c546d908` | Kontext jako kruhový progress | UI indikátor |
| `7c05f238` | Cron výrazy v Scheduled Tasks | Task editor |
| `7bf2e5a3` | Toast při chybějící definici agenta | Error UX |
| `e3daeae1` | Ochrana při mazání vestavěných agentů | Agent safety |
| `5e13f79f` | Pinned startery se načtou ihned | Chat UX |
| `dfd138c3` | Deduplikace desktop notifikací | Notifikace |
| `93485f08` | Oprava Android session button | Mobile fix |
| `797bbc56` | noindex/robots.txt pro self-hosted | Bezpečnost |
| `0847bfc8` | Lepší detekce verze v instalátoru | CLI |
| `5cd8b9d3` | Stabilizace session diagnostiky + Windows | Spolehlivost |
| `fe6cff65` | Stabilizace načítání historie diffů | Git |
| `f988fd44` | Pin Windows release runner na 2022 | CI |

## Fáze 2: Commity s potenciálním konfliktem (12 commitů)

Tyto commity mění soubory, které fork také upravil. Vyžadují pozornost při merge.

| Hash | Popisek | Riziko konfliktu |
|------|--------|------------------|
| `e88afff2` | Chat streaming perf + sidebar render cost | **Střední** — může měnit `ChatInput.tsx` nebo sidebar komponenty |
| `b51dd008` | Right sidebar perf (gate live effects, memoize) | **Střední** — může kolidovat s fork sidebar toggle |
| `65258d2c` | Prevence session folder rerender loop | **Střední** — může měnit `SidebarProjectsList.tsx` |
| `0d4009c4` | Přepsání markdown rendering na marked + Shiki + morphdom | **Vysoké** — přepisuje celý rendering pipeline |
| `a08b4612` | Přesun code highlighting na Shiki worker | **Střední** — nahrází react-syntax-highlighter |
| `55a098f6` | Nahrazení prismjs za Shiki worker | **Střední** — dependency swap |
| `552c2217` | Shiki syntax highlighting v CodeMirror editoru | **Nízké** — nový feature |
| `1599bfe1` | Shiki highlighting v PlanView a SkillsPage | **Nízké** — nový feature |
| `4c26ce36` | Synchronizace iframe themes | **Střední** — může měnit theme soubory |
| `c3e37e5a` | Synchronizace embedded chat theme | **Střední** — může měnit theme soubory |
| `e24cd63c` | Zrychlení načítání providerů/agentů | **Nízké** — startup flow |
| `0542bcfc` | OpenCode config defaults non-blocking | **Nízké** — startup flow |

## Fáze 3: Changelog a release commity (5 commitů)

| Hash | Popisek | Akce |
|------|--------|------|
| `c5dd4f49` | Changelog entries | cherry-pick nebo ručně |
| `ddb92585` | Changelog entries | cherry-pick nebo ručně |
| `bfd202b1` | Changelog entries | cherry-pick nebo ručně |
| `62184049` | Odstranění dead syntaxTheme plumbing | cherry-pick |
| `ba61fb7c` | Docs update security contact | cherry-pick |

## Fáze 4: Release commity (přeskočit)

| Hash | Popisek | Akce |
|------|--------|------|
| `dfa0ec61` | Release v1.13.1 | Přeskočit — manuálně bumpneme verzi |
| `bbc89a65` | Release v1.13.2 | Přeskočit — manuálně bumpneme verzi |

## Doporučený postup

1. **Vytvořit feature branch** `upgrade/v1.13.2` z aktuálního `nyk/feature/redesign-chat-input`
2. **Cherry-picknout fázi 1** (14 bezkonfliktních commitů) — sériově, ověřit po každém
3. **Cherry-picknout fázi 2** (12 konfliktních commitů) — jeden po druhém, ručně řešit konflikty
4. **Cherry-picknout fázi 3** (changelog) — přizpůsobit fork changelog
5. **Přeskočit fázi 4** (release commity) — verzi bumpneme na `1.13.2` manuálně v `package.json`
6. **Spustit validaci** — `bun run type-check` + `bun run lint`
7. **Otestovat** — manuálně ověřit chat streaming, sidebar přepínání, Shiki highlighting, scheduled tasks

## Specifické konflikty k řešení

### 1. Chat streaming perf (`e88afff2`)
- Fork přepsal `ChatInput.tsx` na glassmorphism styl
- Upstream přidává izolaci streaming renderů
- Řešení: Cherry-picknout upstream změny, pak ručně přidat glassmorphism třídy zpět

### 2. Right sidebar perf (`b51dd008`)
- Fork přidal `experimentalSidebar` toggle a `MinimalProjectsList`
- Upstream přidává gate live effects a memoizaci
- Řešení: Cherry-picknout upstream změny do `SidebarProjectsList.tsx`, pak přidat fork toggle logiku zpět

### 3. Markdown rendering rewrite (`0d4009c4`)
- Přepisuje celý rendering pipeline na marked + Shiki + morphdom
- Fork mění CSS v `index.css` a `design-system.css`
- Řešení: Cherry-picknout, pak ověřit že fork CSS proměnné jsou stále platné

### 4. Theme sync (`4c26ce36`, `c3e37e5a`)
- Upstream synchronizuje embedded chat/iframe themes
- Fork mění `cssGenerator.ts` a `design-system.css`
- Řešení: Cherry-picknout, pak ověřit fork theme tokeny

## Závěr

Celkem **31 cherry-picků** (kromě 5 release/changelog a 2 release commitů). Z toho **14 bezkonfliktních**, **12 s potenciálním konfliktem**, **5 s nízkým rizikem**. Celý proces by měl zabrat ~2-3 hodiny práce s ohledem na ruční řešení konfliktů.