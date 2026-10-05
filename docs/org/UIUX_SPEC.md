# FORGINITY ORG — DESIGN SYSTEM & UI/UX SPECIFICATION (UIUX_SPEC)

## DOCUMENT CONTROL

- **Organization Name:** Forginity
- **AI Engine Profile:** UI/UX Skill Persona v2.0 (Organization Design System Focus)
- **Date Updated:** 2026-10-01
- **Associated Strategy & Product Sources:** [docs/org/SMA-PVR.md](file:///home/vikas/Documents/forginity/docs/org/SMA-PVR.md) & [docs/org/PRD.md](file:///home/vikas/Documents/forginity/docs/org/PRD.md)
- **Target Implementation Path:** `packages/ui`, `packages/config`, `apps/`

---

## 1. GLOBAL VISUAL IDENTITY & POWDER COLOR PALETTE

### Design Theme Strategy
- **Aesthetic Direction:** Powder Dark Theme — soft, matte powder color accents set against ultra-deep dark surfaces for reduced eye strain during long usage sessions.
- **Typography Standard:** **Lexend** (Google Font), with **Light (300)** and **Regular (400)** font weights applied as the default UI typography for maximum clarity and clean modern reading.
- **Core Principles:** 
  1. *Unified Shell:* Every Forginity product shares identical navigation bars, user profile menus, and app-switcher components using the Lexend powder theme.
  2. *High Information Contrast:* Soft powder green highlights (`#67F29A`) paired with deep forest primary surfaces (`#173326`) and powder dark backgrounds (`#050606`).
  3. *Zero Layout Shift:* Skeleton primitives matching Lexend font heights and card dimensions.

### Color Tokens (Powder Dark Theme)

| Token Name | Hex Code | Purpose / Usage Context |
| :--- | :--- | :--- |
| **`bg`** | `#050606` | Main application background surface |
| **`surface`** | `#121513` | Elevated card surfaces, container panels, and dropdown backgrounds |
| **`primary`** | `#173326` | Deep powder forest green container actions & button backgrounds |
| **`primary-foreground`** | `#67F29A` | High-luminance powder mint green for active text, icons, CTAs & highlights |
| **`text`** | `#F5F7F5` | Primary headings, title banners, and crisp white-mint typography |
| **`body`** | `#D7DCD9` | Default body copy, paragraphs, table rows, and description text |
| **`mute`** | `#7C8580` | Muted labels, secondary captions, subtle borders, and disabled states |
| **`error`** | `#C98793` | Soft powder rose/red for form errors, danger alerts, and failed statuses |

```css
/* Powder Dark Theme Tokens (packages/ui/src/styles/globals.css) */
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap');

:root {
  --font-lexend: 'Lexend', sans-serif;
  font-family: var(--font-lexend);
  font-weight: 300; /* Light default weight */
  
  --background: #050606;
  --surface: #121513;
  --surface-hover: #1b201d;
  --border: #1e2420;
  
  --primary: #173326;
  --primary-foreground: #67F29A;
  
  --text-main: #F5F7F5;
  --text-body: #D7DCD9;
  --text-muted: #7C8580;
  
  --error: #C98793;
}
```

---

## 2. DESIGN SYSTEM GUIDELINES & STANDARDS (GLOBAL SYSTEM GUIDE)

Inspired by Atlassian Design System, Apple Human Interface Guidelines, and Google Material Design 3, Forginity enforces strict responsive scaling, typography hierarchy, spatial rhythms, radii, and component sizes across all device form factors.

### A. Device Breakpoint Matrix

| Device Profile | Breakpoint Range | Grid Columns | Navigation Pattern | Container Max-Width |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile** | `320px – 639px` (`sm`) | 4 Columns | Bottom Tab Bar + Full-Bleed Drawers | 100% (Fluid) |
| **Tablet** | `640px – 1023px` (`md`) | 8 Columns | Collapsible Hover Sidebar + Header | 720px |
| **Desktop** | `1024px – 1919px` (`lg`/`xl`) | 12 Columns | Fixed Persistent Left Sidebar + Shell Header | 1280px |
| **TV / Ultra-Wide** | `≥ 1920px` (`2xl`/4K) | 16 Columns | Centered Canvas Shell + Floating Control Bar | 1600px |

---

### B. Typography Scaling Matrix per Device (Lexend Light Default)

| Element | Mobile (`sm`) | Tablet (`md`) | Desktop (`lg`/`xl`) | TV / Ultra-Wide (`2xl`) | Font Weight |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | `28px` / `34px` LH | `40px` / `48px` LH | `56px` / `64px` LH | `72px` / `80px` LH | Lexend Medium (500) |
| **Heading 1 (H1)** | `24px` / `30px` LH | `30px` / `36px` LH | `36px` / `44px` LH | `48px` / `56px` LH | Lexend Regular (400) |
| **Heading 2 (H2)** | `20px` / `26px` LH | `22px` / `28px` LH | `24px` / `32px` LH | `32px` / `40px` LH | Lexend Regular (400) |
| **Heading 3 (H3)** | `16px` / `22px` LH | `17px` / `24px` LH | `18px` / `26px` LH | `24px` / `32px` LH | Lexend Light (300) |
| **Body Text** | `14px` / `20px` LH | `15px` / `22px` LH | `15px` / `24px` LH | `18px` / `28px` LH | Lexend Light (300) |
| **Caption / Muted**| `12px` / `16px` LH | `12px` / `18px` LH | `13px` / `18px` LH | `14px` / `20px` LH | Lexend Light (300) |

---

### C. Spatial System & Grid Rhythm (8px Base Grid)

```css
--space-2xs: 4px;   /* Micro spacing, badge padding, internal icon gaps */
--space-xs:  8px;   /* Compact element padding, button gap */
--space-sm:  12px;  /* Card internal padding (mobile), list item gap */
--space-md:  16px;  /* Standard container padding, form field gap */
--space-lg:  24px;  /* Section spacing, card group gap */
--space-xl:  32px;  /* Major layout section gap */
--space-2xl: 48px;  /* Page margin spacing */
--space-3xl: 64px;  /* Hero section padding */
```

---

### D. Border Radius Scale

```css
--radius-sm: 4px;    /* Chips, tags, inline code blocks, badges */
--radius-md: 8px;    /* Buttons, input fields, dropdown menus */
--radius-lg: 12px;   /* Cards, modal dialogs, drawer containers */
--radius-xl: 16px;   /* Major dashboard container panels */
--radius-full: 9999px; /* Avatars, pill badges, toggle switches */
```

---

### E. Button Sizes & Touch Target Specifications

| Button Tier | Height | Horizontal Padding | Icon Size | Min Touch Target | Target Context |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Small (`btn-sm`)** | `32px` | `12px` | `14px` | `44px x 44px` (padded) | Table actions, inline filters, compact headers. |
| **Medium (`btn-md`)**| `40px` | `16px` | `16px` | `44px x 44px` | Standard forms, primary page actions, modal CTAs. |
| **Large (`btn-lg`)** | `48px` | `24px` | `20px` | `48px x 48px` | Hero CTAs, mobile touch actions, checkout buttons. |
| **Extra Large (`btn-xl`)**| `56px`| `32px` | `24px` | `56px x 56px` | TV remote control views, gloved-hand outdoor actions. |

---

## 3. ICONOGRAPHY, ART DIRECTION & ANIMATION DICTIONARY

- **Iconography:** Lucide Icons (`lucide-react`) across all micro-frontends with standard stroke width of `1.5px` rendered in Powder Mint (`#67F29A`) or Muted Gray (`#7C8580`).

- **Micro-Interactions & Transitions:**
  - *Buttons & Interactive Elements:* `transition-all duration-150 ease-in-out hover:brightness-110 active:scale-[0.98]`
  - *Dropdowns & Modals:* `animate-in fade-in-0 zoom-in-95 duration-150 ease-out`
  - *Skeleton Loading:* `animate-pulse bg-[#121513] border border-[#1e2420] rounded-md`

---

## 4. MICRO-FRONTEND CONTAINER & APP SWITCHER SHELL

All sub-products (TrackRide, Custom Cloth, Raksha, etc.) run inside or link back to the **Forginity Unified Shell** UI styled in Powder Dark Theme:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  ❖ FORGINITY  │  [App Switcher ▾]   Search products...      ( Notifications ) [User ▾] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   [ Micro-Frontend Sub-App Viewport Remote: e.g. TrackRide / Custom Cloth ]            │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Global Shell Components (`packages/ui/shell`)
1. **Global Header (`ForginityHeader`):**
   - Brand logo emblem in Powder Mint (`#67F29A`).
   - **App Switcher Dropdown (`AppLauncher`):** Quick-switch grid overlay listing all active products in the Forginity ecosystem.
   - **Unified User Profile (`UserMenu`):** Shows SSO user avatar, active workspace/organization, billing link, and theme toggles.
2. **SSO Auth Modal (`AuthModal`):**
   - Unified Sign-in / Sign-up dialog rendered by `apps/auth` remote micro-frontend.
   - Lexend Light font inputs, `#173326` primary buttons, and `#67F29A` accent text.

---

## 5. COMPONENT STATE GRANULARITY STANDARDS

Every view across all Forginity products must implement 4 structural component states:

1. **Ideal State:** Fully populated content grid with active data readouts, micro-animations, and interactive controls in Lexend Light typography.
2. **Empty Onboarding State:** Soft powder-accented illustration, clear Lexend headline (`#F5F7F5`), and prominent primary action CTA in `#173326` / `#67F29A`.
3. **Loading Skeleton State:** Layout-shift-free skeleton blocks (`#121513`) matching the exact dimensions of cards, tables, and buttons.
4. **Error / Validation State:** Powder Rose inline form validation highlights (`#C98793`) + persistent toast banners with actionable retry buttons for API/network failures.

---

## 6. DEVELOPER HANDOFF & TOKEN EXPORT

- Tokens exported via `@forginity/ui` package.
- Standardized CSS variable imports in `packages/ui/src/styles/globals.css`.
- Shared Tailwind configuration exported in `packages/config/tailwind.config.js`.

---
