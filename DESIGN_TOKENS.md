# Design Tokens Reference

Quick reference for all design system tokens used in the Web3 Music NFT Dashboard.

## Color Tokens

### Primary Colors

```css
/* Midnight (Background) */
--color-midnight: #0D0D12;
--color-midnight-rgb: 13, 13, 18;
--color-midnight-hsl: 240°, 16%, 6%;
Tailwind: bg-midnight, text-midnight

/* Cyber Pink (Primary CTA) */
--color-cyber-pink: #FF1F8A;
--color-cyber-pink-rgb: 255, 31, 138;
--color-cyber-pink-hsl: 310°, 98%, 56%;
Tailwind: bg-cyber-pink, text-cyber-pink

/* Soft Lavender (Secondary) */
--color-lavender: #B794F4;
--color-lavender-rgb: 183, 148, 244;
--color-lavender-hsl: 270°, 93%, 77%;
Tailwind: bg-lavender, text-lavender
```

### Neutral Colors

```css
/* White (Text) */
--color-text-primary: #FFFFFF;
Tailwind: text-white

/* White @ 80% (Body Text) */
--color-text-secondary: rgba(255, 255, 255, 0.8);
Tailwind: text-white/80

/* White @ 60% (Secondary Text) */
--color-text-muted: rgba(255, 255, 255, 0.6);
Tailwind: text-white/60

/* White @ 40% (Disabled Text) */
--color-text-disabled: rgba(255, 255, 255, 0.4);
Tailwind: text-white/40
```

### Background & Surface Colors

```css
/* Glass Background (2%) */
--color-glass-bg: rgba(255, 255, 255, 0.02);
Tailwind: bg-white/[0.02]

/* Glass Background Hover (5%) */
--color-glass-bg-hover: rgba(255, 255, 255, 0.05);
Tailwind: bg-white/[0.05]

/* Border Color (8%) */
--color-border: rgba(255, 255, 255, 0.08);
Tailwind: border-white/[0.08]

/* Border Color Hover (12%) */
--color-border-hover: rgba(255, 255, 255, 0.12);
Tailwind: border-white/[0.12]
```

## Shadow & Effect Tokens

### Box Shadows

```css
/* Pink Glow (Primary) */
--shadow-pink-glow: 0 8px 24px rgba(255, 31, 138, 0.15);
Tailwind: shadow-pink-glow

/* Card Glow (Hover) */
--shadow-card-glow: 0 0 20px rgba(255, 31, 138, 0.1);
Tailwind: shadow-card-glow

/* Subtle Shadow */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);

/* Medium Shadow */
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);

/* Large Shadow */
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
```

### Backdrop Effects

```css
/* Glass Blur */
--backdrop-blur: blur(8px);

/* Light Blur */
--backdrop-blur-sm: blur(4px);

/* Heavy Blur */
--backdrop-blur-lg: blur(12px);
```

## Typography Tokens

### Font Families

```css
/* Headings & UI (Primary) */
--font-display: 'Neue Machina', 'Space Mono', monospace;
Tailwind: font-sans

/* Code & Addresses (Monospace) */
--font-mono: 'IBM Plex Mono', monospace;
Tailwind: font-mono

/* Fallback */
--font-fallback: 'Space Mono', monospace;
```

### Font Weights

```css
/* Light (Neue Machina) */
--font-weight-light: 300;

/* Regular (Default) */
--font-weight-regular: 400;

/* Medium (Mono) */
--font-weight-medium: 500;

/* Semibold (Mono) */
--font-weight-semibold: 600;

/* Bold */
--font-weight-bold: 700;

/* Ultra Bold (Neue Machina) */
--font-weight-ultrabold: 900;
```

### Font Sizes

```css
/* Small Text */
--font-size-xs: 12px;
--line-height-xs: 16px;
Tailwind: text-xs

/* Small Label */
--font-size-sm: 14px;
--line-height-sm: 20px;
Tailwind: text-sm

/* Body Text */
--font-size-base: 16px;
--line-height-base: 24px;
Tailwind: text-base

/* Large Text */
--font-size-lg: 18px;
--line-height-lg: 28px;
Tailwind: text-lg

/* Heading 3 */
--font-size-xl: 20px;
--line-height-xl: 28px;
Tailwind: text-xl

/* Heading 2 */
--font-size-2xl: 24px;
--line-height-2xl: 32px;
Tailwind: text-2xl

/* Heading 1 */
--font-size-3xl: 30px;
--line-height-3xl: 36px;
Tailwind: text-3xl
```

### Line Heights

```css
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.625;
```

## Spacing Tokens

### Padding & Margin (8px base)

```css
--spacing-0: 0;
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-10: 40px;
--spacing-12: 48px;
```

Tailwind: `p-4`, `m-2`, `px-6`, `py-8`, etc.

### Gap (Flex/Grid)

```css
--gap-2: 8px;
--gap-3: 12px;
--gap-4: 16px;
--gap-6: 24px;
--gap-8: 32px;
```

Tailwind: `gap-4`, `gap-x-2`, `gap-y-6`, etc.

## Border Radius Tokens

```css
/* Small */
--radius-sm: calc(var(--radius) - 4px);

/* Medium */
--radius-md: calc(var(--radius) - 2px);

/* Large */
--radius-lg: var(--radius);
Tailwind: rounded-lg

/* Default Radius */
--radius: 12px;

/* Full Circle */
--radius-full: 9999px;
Tailwind: rounded-full
```

## Component Utility Tokens

### Glass Cards

```css
.glass {
  background: var(--color-glass-bg);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-pink-glow);
}
```

### Glass Cards with Hover

```css
.glass-hover {
  @apply glass transition-all duration-300;
}

.glass-hover:hover {
  background: var(--color-glass-bg-hover);
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-card-glow);
}
```

### Gradient Text

```css
.gradient-text {
  background: linear-gradient(to right, var(--color-cyber-pink), var(--color-lavender));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Primary Button

```css
.button-primary {
  background: var(--color-cyber-pink);
  color: white;
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(255, 31, 138, 0.2);
  transition: all 0.3s ease;
}

.button-primary:hover {
  background: rgb(255 31 138 / 0.9);
  box-shadow: 0 8px 16px rgba(255, 31, 138, 0.3);
}
```

### Secondary Button

```css
.button-secondary {
  background: transparent;
  border: 1px solid var(--color-border);
  color: white;
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.button-secondary:hover {
  background: var(--color-glass-bg-hover);
  border-color: var(--color-border-hover);
}
```

## Transition & Animation Tokens

### Transitions

```css
--transition-fast: 200ms ease-out;
--transition-normal: 300ms ease-out;
--transition-slow: 500ms ease-out;

Tailwind: transition, transition-all, duration-300
```

### Animations

```css
/* Pulse Pink */
@keyframes pulse-pink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

--animation-pulse: pulse-pink 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
Tailwind: animate-pulse-pink
```

## Grid Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  /* 1 column */
}

/* Tablet */
@media (min-width: 640px) and (max-width: 1024px) {
  /* 2 columns */
}

/* Desktop */
@media (min-width: 1024px) and (max-width: 1280px) {
  /* 3 columns */
}

/* Extra Wide */
@media (min-width: 1280px) {
  /* 4 columns */
}

Tailwind: sm:, md:, lg:, xl:, 2xl:
```

## Color Usage Guide

| Element | Color | Token | Hex |
|---------|-------|-------|-----|
| Background | Midnight | --color-midnight | #0D0D12 |
| Primary Text | White | --color-text-primary | #FFFFFF |
| Secondary Text | White @ 60% | --color-text-muted | rgba(255,255,255,0.6) |
| Primary Button | Cyber Pink | --color-cyber-pink | #FF1F8A |
| Secondary Label | Lavender | --color-lavender | #B794F4 |
| Border | White @ 8% | --color-border | rgba(255,255,255,0.08) |
| Glass BG | White @ 2% | --color-glass-bg | rgba(255,255,255,0.02) |
| Price/Address | Cyber Pink | --color-cyber-pink | #FF1F8A |
| Badge | Lavender | --color-lavender | #B794F4 |
| Glow | Pink @ 15% | --shadow-pink-glow | rgba(255,31,138,0.15) |

## Tailwind Class Reference

### Colors
```
bg-midnight, text-midnight
bg-cyber-pink, text-cyber-pink
bg-lavender, text-lavender
text-white, text-white/80, text-white/60, text-white/40
bg-white/[0.02], bg-white/[0.05]
border-white/[0.08], border-white/[0.12]
```

### Shadows
```
shadow-pink-glow
shadow-card-glow
shadow-lg, shadow-md, shadow-sm
```

### Effects
```
backdrop-blur-md
```

### Spacing
```
p-4, px-6, py-8
m-2, mx-4, my-6
gap-4, gap-x-2, gap-y-6
```

### Typography
```
font-sans (Neue Machina)
font-mono (IBM Plex Mono)
font-bold, font-semibold, font-medium
text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl
```

### Borders & Radius
```
border, border-white/[0.08]
rounded-lg, rounded-md, rounded-sm, rounded-full
```

### Transitions
```
transition-all, duration-300
hover:, focus:, active:
```

## HSL Reference

Using HSL for better color manipulation:

```
Midnight Blue:    hsl(240°, 16%, 6%)
Cyber Pink:       hsl(310°, 98%, 56%)
Soft Lavender:    hsl(270°, 93%, 77%)
```

Adjust lightness (%) for shades/tints:
- Add 10% → Lighter
- Remove 10% → Darker

## Accessibility Contrast Ratios

```
White on Midnight (#0D0D12):
├─ White text: 21:1 ✅ AAA (Excellent)
├─ Lavender text: 10.5:1 ✅ AAA (Excellent)
└─ Pink text: 7.2:1 ✅ AA (Good)

WCAG Minimum: 4.5:1 for normal text (AA)
Recommended: 7:1+ for optimal readability
```

---

**Last Updated:** February 7, 2026  
**Version:** 1.0.0

Use these tokens consistently across the application for a cohesive design system.
