# Design System & Color Palette

## Color Tokens

### Primary Colors

```
Midnight (Background)
Hex: #0D0D12
RGB: 13, 13, 18
HSL: 240°, 16%, 6%
Usage: Primary background, deep dark surfaces
```

```
Cyber Pink (Primary CTA)
Hex: #FF1F8A
RGB: 255, 31, 138
HSL: 310°, 98%, 56%
Usage: Buttons, active states, highlights
Hover: Brighten to #FF4DA6
```

```
Soft Lavender (Secondary)
Hex: #B794F4
RGB: 183, 148, 244
HSL: 270°, 93%, 77%
Usage: Secondary actions, accents, badges
```

### Neutral & Glass Colors

```
White/Light Foreground
Hex: #FFFFFF
Opacity: 100% (text), 98% (primary text)
Usage: Main text color

White Semi-transparent (Borders)
RGB: 255, 255, 255 @ 8% opacity
Usage: Subtle borders, dividers
CSS: border-white/[0.08]

White Semi-transparent (Glass)
RGB: 255, 255, 255 @ 2% opacity
Usage: Glass card backgrounds
CSS: bg-white/[0.02]

White Semi-transparent (Hover)
RGB: 255, 255, 255 @ 5% opacity
Usage: Hover states on glass cards
CSS: hover:bg-white/[0.05]
```

### Shadow & Glow Effects

```
Pink Glow (Primary)
Box-shadow: 0 8px 24px rgba(255, 31, 138, 0.15)
Tailwind: shadow-pink-glow
Usage: Card highlights, active states

Card Glow (Hover)
Box-shadow: 0 0 20px rgba(255, 31, 138, 0.1)
Tailwind: shadow-card-glow
Usage: Interactive card hover
```

## Component Colors

### Cards & Containers

```
Glass Card (Default)
Background: rgba(255, 255, 255, 0.02)
Border: 1px solid rgba(255, 255, 255, 0.08)
Backdrop Filter: blur(8px)
Border Radius: 12px
Shadow: shadow-pink-glow

Glass Card (Hover)
Background: rgba(255, 255, 255, 0.05)
Border: 1px solid rgba(255, 255, 255, 0.12)
Shadow: shadow-card-glow
Transition: all 300ms
```

### Buttons

```
Primary Button (Mint/Connect)
Background: #FF1F8A (Cyber Pink)
Text: White (#FFFFFF)
Shadow: shadow-lg shadow-cyber-pink/20
Hover: brightness(110%) or opacity 90%

Secondary Button (Outline)
Border: 1px solid rgba(255, 255, 255, 0.12)
Background: transparent
Text: White
Hover: bg-white/[0.05]

Disabled Button
Opacity: 50%
Cursor: not-allowed
```

### Typography Colors

```
Heading Text
Color: White (#FFFFFF)
Font: Neue Machina
Weights: Regular (400), Bold (900)

Body Text
Color: White with opacity (80%)
CSS: text-white/80

Secondary Text
Color: White with opacity (60%)
CSS: text-white/60

Muted Text
Color: White with opacity (40%)
CSS: text-white/40

Prices & Addresses
Color: Cyber Pink (#FF1F8A)
Font: IBM Plex Mono
Font Weight: 600 (Semibold)

Secondary Labels
Color: Soft Lavender (#B794F4)
Font: IBM Plex Mono
Font Weight: 500 (Medium)
```

## Gradients

### Linear Gradients

```
Primary Gradient (Pink to Lavender)
Direction: to-right
From: #FF1F8A (Cyber Pink)
To: #B794F4 (Soft Lavender)
Usage: Text, UI accents, borders

Inverse Gradient (Lavender to Pink)
Direction: to-right
From: #B794F4 (Soft Lavender)
To: #FF1F8A (Cyber Pink)
Usage: Progress bars, secondary accents

Cover Image Gradient
Direction: 135deg (diagonal)
From: Color @ 40% opacity
To: Color @ 10% opacity
Usage: Song card backgrounds
```

## Interactive States

### Button States

```
Default: Cyber Pink background, white text
Hover: Brightness 110% or bg-cyber-pink/90
Active: Brightness 95%
Disabled: Opacity 50%, cursor not-allowed
Focus: Ring with cyber pink outline
```

### Card States

```
Default: Glass effect, subtle border
Hover: Increased backdrop blur, enhanced glow, raised shadow
Active: Pink glow effect, enhanced border visibility
Focus: Ring outline with cyber pink
```

### Badge States

```
Default: Transparent background, lavender text, lavender border
Active: Lavender background, midnight text
Disabled: Muted colors, reduced opacity
```

## Accessibility

### Contrast Ratios

```
Text on midnight background (#0D0D12)
White text: 21:1 (AAA - Excellent)
Lavender text: 10.5:1 (AAA - Excellent)
Pink text: 7.2:1 (AA - Good)

Minimum: 4.5:1 for normal text (WCAG AA)
Recommended: 7:1+ for optimal readability
```

### Dark Mode

The entire design system is optimized for dark mode:
- High contrast for readability
- No bright backgrounds that cause eye strain
- Consistent color application across all components
- Focus indicators clearly visible

## CSS Implementation

### Tailwind Configuration

```javascript
colors: {
  midnight: '#0D0D12',
  'cyber-pink': '#FF1F8A',
  lavender: '#B794F4',
},

boxShadow: {
  'pink-glow': '0 8px 24px rgba(255, 31, 138, 0.15)',
  'card-glow': '0 0 20px rgba(255, 31, 138, 0.1)',
}
```

### Global Utilities (globals.css)

```css
@layer utilities {
  .glass {
    @apply bg-white/[0.02] backdrop-blur-md 
           border border-white/[0.08] rounded-xl;
  }

  .glass-hover {
    @apply glass transition-all duration-300 
           hover:bg-white/[0.05] 
           hover:border-white/[0.12] 
           hover:shadow-card-glow;
  }

  .gradient-text {
    @apply bg-gradient-to-r from-cyber-pink to-lavender 
           bg-clip-text text-transparent;
  }
}
```

## Color Usage Quick Reference

| Element | Color | Hex | Tailwind |
|---------|-------|-----|----------|
| Background | Midnight | #0D0D12 | bg-midnight |
| Text | White | #FFFFFF | text-white |
| Primary Button | Cyber Pink | #FF1F8A | bg-cyber-pink |
| Secondary Label | Lavender | #B794F4 | text-lavender |
| Border | White @ 8% | - | border-white/[0.08] |
| Glass BG | White @ 2% | - | bg-white/[0.02] |
| Hover Glass | White @ 5% | - | hover:bg-white/[0.05] |
| Price Text | Cyber Pink | #FF1F8A | text-cyber-pink |
| Badge | Lavender | #B794F4 | text-lavender |
| Glow Effect | Pink @ 15% | - | shadow-pink-glow |

---

**Design System Version:** 1.0  
**Last Updated:** February 7, 2026  
**Status:** Production Ready
