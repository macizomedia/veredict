# AbQuanta News - Color Palette Library

This document maintains all color palette variations for future theme iterations and reference.

---

## 🎨 "Fintech Slate" Corporate Theme (CURRENT)

**Design Philosophy**: Professional, clean, and trustworthy aesthetic inspired by modern financial technology applications. Features high contrast surfaces with a distinctive corporate blue accent.

### Color Palette

| Palette Name | Hex Code | HSL Value | shadcn/ui Role(s) | Usage Description |
|--------------|----------|-----------|-------------------|-------------------|
| **Slate-900** | `#0D0D0D` | `0 0% 5%` | `--background` | Deepest foundation - main app background |
| **Slate-800** | `#252625` | `120 1% 14%` | `--card`, `--popover`, `--muted` | Surface elements with clear separation |
| **Slate-600** | `#525259` | `240 4% 34%` | `--border`, `--input` | Visible borders and input fields |
| **Slate-400** | `#84848C` | `240 3% 53%` | `--accent` | Interactive hover/focus states |
| **Slate-300** | `#9C9FA6` | `219 5% 63%` | `--muted-foreground` | Secondary text and descriptions |
| **Corporate-Blue** | `#3B82F6` | `217 91% 59%` | `--primary` | Primary actions, CTAs, links |
| **White** | `#FFFFFF` | `0 0% 100%` | `--foreground`, `--primary-foreground` | Primary text and text on blue |

### Design Rationale
- **9% contrast difference** between background (5%) and cards (14%) for clear surface definition
- **Corporate Blue** provides strong brand identity and trustworthy feel
- **High contrast text** ensures excellent readability
- **Professional aesthetic** suitable for financial/political content

---

## 🌙 "Midnight Slate" Theme (PREVIOUS)

**Design Philosophy**: Dark-first design with enhanced contrast and interaction states.

### Color Palette

| Palette Name | Hex Code | HSL Value | shadcn/ui Role(s) |
|--------------|----------|-----------|-------------------|
| **Slate-900** | `#0A0B0D` | `225 12% 4%` | `--background` |
| **Slate-700** | `#363740` | `236 8% 23%` | `--card`, `--popover` |
| **Slate-500** | `#656773` | `230 6% 42%` | `--border`, `--input` |
| **Slate-400** | `#7D7F8C` | `230 6% 51%` | `--accent` |
| **Slate-50** | `#F0F2F5` | `220 17% 95%` | `--foreground`, `--primary` |

---

## 🏢 Future Theme Ideas

### "Executive Dark"
- Charcoal base with gold accents
- Target: Premium/enterprise feel

### "News Blue"
- Deep navy with bright blue accents
- Target: Traditional news media aesthetic

### "Political Red"
- Dark slate with conservative red accents
- Target: Political content emphasis

### "Analyst Green"
- Dark base with financial green accents
- Target: Economic/financial analysis

---

## 🛠 Implementation Guidelines

### Theme Structure Template
```css
.dark {
  /* Core Surfaces */
  --background: [deepest-color];
  --foreground: [highest-contrast-text];
  --card: [elevated-surface];
  --card-foreground: [card-text];
  
  /* Interactive Elements */
  --primary: [brand-color];
  --primary-foreground: [text-on-brand];
  --accent: [hover-states];
  --accent-foreground: [text-on-hover];
  
  /* Utility Colors */
  --muted: [subtle-backgrounds];
  --muted-foreground: [secondary-text];
  --border: [visible-separators];
  --input: [form-field-borders];
  
  /* System Colors */
  --destructive: [error-red];
  --destructive-foreground: [text-on-error];
  --ring: [focus-outlines];
}
```

### Naming Conventions
- **Base Colors**: Use descriptive names (Corporate-Blue, Financial-Green, etc.)
- **Semantic Roles**: Follow shadcn/ui variable naming
- **HSL Format**: Use HSL for better color manipulation
- **Documentation**: Always include design rationale

---

**Last Updated**: August 3, 2025  
**Current Active Theme**: Fintech Slate Corporate  
**Next Planned**: Executive Dark variant
