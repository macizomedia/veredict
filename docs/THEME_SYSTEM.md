# Theme System Documentation

## Overview
The Veridict application features a sophisticated three-mode theme system:
- **Light Mode**: Standard light theme with high contrast
- **Dark Mode**: Modern dark theme with blue-based color palette  
- **Night Mode**: Warm-toned dark theme with reduced blue light for better eye comfort

## Architecture

### Core Components

#### 1. Theme Provider (`/src/components/theme-provider.tsx`)
- Wraps the entire application with `next-themes` context
- Configured with three custom themes: `["light", "dark", "night"]`
- Default theme set to "dark"
- System theme detection disabled for consistent experience
- Transitions disabled for immediate theme switching

#### 2. Theme Toggle (`/src/components/theme-toggle.tsx`)
- Dropdown interface for theme selection
- Visual icons for each theme:
  - 🌞 Sun icon for Light mode
  - 🌙 Moon icon for Dark mode  
  - 🌅 Sunset icon for Night mode
- Integrated into navigation bar

#### 3. CSS Theme Definitions (`/src/styles/globals.css`)
- Uses OKLCH color space for superior color control
- Three complete color schemes defined as CSS custom properties
- Night mode features warm color palette (hue 40-60) with reduced blue light

### Color System

#### Light Mode
- Background: `oklch(98% 0.02 106)`
- Foreground: `oklch(15% 0.02 106)`
- Muted: Light grays for secondary content

#### Dark Mode  
- Background: `oklch(13% 0.02 106)`
- Foreground: `oklch(98% 0.02 106)`
- Blue-based accent colors

#### Night Mode (Reduced Blue Light)
- Background: `oklch(12% 0.05 50)` - Warm base
- Foreground: `oklch(95% 0.02 50)` - Warm white
- Accent colors shifted to warmer hues (40-60 range)
- Designed to reduce eye strain during nighttime use

### Semantic Color Classes
Components use semantic Tailwind classes that automatically adapt to themes:
- `bg-background` / `text-foreground` - Primary background/text
- `text-muted-foreground` - Secondary text
- `bg-muted` - Secondary backgrounds
- `border` - Adaptive borders

### Implementation Notes

#### Theme Persistence
- Themes are automatically persisted in localStorage by next-themes
- No additional persistence logic required

#### Transition Management
- Transitions disabled (`disableTransitionOnChange: true`) to prevent flash
- Immediate theme switching for better user experience

#### Component Updates
Key components updated to use semantic theme classes:
- Navigation bar (`/src/components/navigation.tsx`)
- Main page (`/src/app/page.tsx`)
- Posts feed (`/src/app/_components/posts-feed.tsx`)

## Usage

### Adding Theme Awareness to New Components
1. Use semantic Tailwind classes instead of hardcoded colors:
   ```tsx
   // ❌ Hardcoded
   <div className="bg-white text-gray-900">
   
   // ✅ Theme-aware
   <div className="bg-background text-foreground">
   ```

2. For custom colors that need theme variants:
   ```tsx
   <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
   ```

### Accessing Theme in Components
```tsx
import { useTheme } from "next-themes";

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div>
      Current theme: {theme}
      <button onClick={() => setTheme('night')}>
        Switch to Night Mode
      </button>
    </div>
  );
}
```

## Benefits

1. **Accessibility**: Three distinct themes cater to different user preferences and needs
2. **Eye Comfort**: Night mode reduces blue light exposure
3. **Modern UX**: Smooth theme switching with visual indicators
4. **Maintainability**: Semantic color system makes theme updates easier
5. **Performance**: No layout shifts during theme changes

## Future Enhancements

Potential improvements to consider:
- Auto-switching based on time of day
- Custom theme creation interface
- Color contrast ratio testing
- Integration with system accessibility preferences
