# Font Setup Guide

## Adding Neue Machina Fonts

The Web3 Music NFT Dashboard is configured to use **Neue Machina** as the primary heading font and **IBM Plex Mono** for monospace elements.

### Quick Setup

#### Option 1: Using Local Font Files (Recommended)

1. **Download Neue Machina**
   - Visit [Pangram Pangram](https://pangrampangram.com/products/neue-machina)
   - Alternative: Try [Font Download Sites] (ensure you have proper licensing)

2. **Place Font Files**
   ```
   /public/fonts/
   ├── NeueMachina-Light.otf
   ├── NeueMachina-Regular.otf
   └── NeueMachina-Ultrabold.otf
   ```

3. **Verify Setup**
   - The `app/layout.tsx` already imports these fonts
   - Font variables are set: `--font-neue-machina`, `--font-ibm-plex-mono`
   - Fonts are applied to tailwind config via `fontFamily.sans`

#### Option 2: Automatic Fallback (No Setup Needed)

If you don't have Neue Machina, the app automatically falls back to **Space Mono** with the same styling. The dashboard will still look great!

### Font Weights Included

```
Neue Machina:
- Light (300): Subtle headlines, secondary text
- Regular (400): Body text, standard weight
- Ultrabold (900): Strong headings, CTAs

IBM Plex Mono:
- Regular (400): Addresses, code
- Medium (500): Labels
- Semibold (600): Emphasized monospace
```

### Tailwind Font Classes

```html
<!-- Headings use Neue Machina (or fallback) -->
<h1 class="font-sans font-bold">Music NFT Dashboard</h1>

<!-- Monospace for addresses/prices -->
<p class="font-mono text-sm">0x1234...5678</p>
```

### Testing Fonts

After adding the font files, you'll see:

1. **Headings** display in Neue Machina's geometric, modern style
2. **Prices & Addresses** display in IBM Plex Mono's monospace style
3. **Hover effects** maintain font consistency

### Troubleshooting

**Fonts not loading?**
- Check file paths in `/public/fonts/` are exact
- Verify file names match exactly (case-sensitive)
- Check browser DevTools → Network tab for font requests
- Look for console errors about missing font files

**Fallback fonts showing?**
- This is OK! Space Mono looks similar
- Dashboard is still fully functional
- Real fonts will load when files are added

**Bold/Light weights not working?**
- Ensure all three .otf files are present
- Verify weights in filenames (Light, Regular, Ultrabold)
- Check tailwind.config.ts for font config

### Font Details

| Font | Usage | Weights | Format |
|------|-------|---------|--------|
| **Neue Machina** | Headings, UI | 300, 400, 900 | .otf |
| **IBM Plex Mono** | Code, addresses, prices | 400, 500, 600 | Google Fonts |

### Alternative Fonts

If Neue Machina isn't available, these similar fonts work well:

- **Headings:** Space Mono, Courier Prime, JetBrains Mono
- **Code:** IBM Plex Mono (already fallback), Roboto Mono, Fira Code

---

**Note:** The app is fully functional without Neue Machina. Add it when available for optimal branding.
