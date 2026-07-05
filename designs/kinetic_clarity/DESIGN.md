---
name: Kinetic Clarity
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#424750'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#727781'
  outline-variant: '#c2c6d2'
  surface-tint: '#25609f'
  primary: '#225e9c'
  on-primary: '#ffffff'
  primary-container: '#4077b7'
  on-primary-container: '#fdfcff'
  inverse-primary: '#a3c9ff'
  secondary: '#2d609b'
  on-secondary: '#ffffff'
  secondary-container: '#90beff'
  on-secondary-container: '#114c86'
  tertiary: '#355e89'
  on-tertiary: '#ffffff'
  tertiary-container: '#4f77a4'
  on-tertiary-container: '#fdfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d3e3ff'
  primary-fixed-dim: '#a3c9ff'
  on-primary-fixed: '#001c39'
  on-primary-fixed-variant: '#004882'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#a4c9ff'
  on-secondary-fixed: '#001c39'
  on-secondary-fixed-variant: '#074882'
  tertiary-fixed: '#d1e4ff'
  tertiary-fixed-dim: '#a1cafb'
  on-tertiary-fixed: '#001d36'
  on-tertiary-fixed-variant: '#1c4973'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is engineered for a premium file transfer experience that balances high-performance utility with an approachable, sophisticated aesthetic. The brand personality is rooted in **trust, speed, and intelligence**, targeting professionals and teams who value precision and reliability.

The visual direction utilizes a **Modern Minimalist** style with subtle **Glassmorphic** accents. It leverages expansive whitespace, a refined color palette, and high-clarity typographic hierarchy to reduce cognitive load during complex tasks. The interface should feel "light" and "aerodynamic," evoking the sensation of effortless data movement.

## Colors
The palette is centered around "MyTransfer Blue," a color chosen for its association with professional stability and digital fluidity. 

- **Primary & Secondary:** Used for core actions, progress indicators, and brand touchpoints.
- **Surface Strategy:** The background (#F8FAFC) provides a cool, crisp canvas that allows white cards and containers to pop with subtle elevation.
- **Functional Colors:** Success, Warning, and Danger colors are calibrated for high legibility against the neutral background to ensure critical system states are never missed.

## Typography
This design system relies exclusively on **Inter** to maintain a systematic, utilitarian feel that scales perfectly from dense data tables to large marketing displays. 

Tighten letter-spacing on larger headings to maintain a "premium" feel. Use the `label-sm` style for metadata and secondary information to provide contrast against primary body text. Ensure all primary interactions (buttons, links) use the `label-md` weight for better affordance.

## Layout & Spacing
The layout philosophy follows a **Fluid Grid** with generous "Safe Zones" to evoke a sense of speed and lack of clutter.

- **Desktop:** 12-column grid, 24px gutters, 40px+ side margins.
- **Tablet:** 8-column grid, 16px gutters, 24px side margins.
- **Mobile:** 4-column grid, 16px gutters, 16px side margins.

Use a 4px baseline rhythm. For file transfer lists and dashboard views, prioritize vertical breathing room (minimum 16px between list items) to ensure the UI feels calm even when many files are present.

## Elevation & Depth
Depth is created through **Ambient Shadows** and **Tonal Layers**. Instead of harsh borders, use soft, diffused shadows with a slight blue tint (`rgba(77, 130, 195, 0.08)`) to connect the elements to the brand color.

- **Level 0 (Background):** #F8FAFC.
- **Level 1 (Cards/Containers):** White (#FFFFFF) with a 1px border (#E2E8F0) and a soft, large-radius shadow.
- **Level 2 (Modals/Overlays):** White with a more pronounced shadow and a backdrop blur (12px) on the obscured content to maintain focus.
- **Interactive:** Elements should subtly lift on hover, increasing shadow spread and decreasing y-offset.

## Shapes
The shape language is defined by **High-Radius Curves**. While the base `roundedness` is set to 2 (0.5rem), the "2xl" characteristic of this system applies specifically to large containers and primary action areas.

- **Small elements (Checkboxes, Tags):** 4px - 8px radius.
- **Standard elements (Inputs, Buttons):** 12px radius.
- **Large elements (Cards, Upload Zones):** 24px (1.5rem) radius.
This progressive rounding creates a "nested" visual logic that feels organic and modern.

## Components
Consistent application of the following component styles is required:

- **Buttons:** Primary buttons use the MyTransfer Blue background with white text and 12px rounding. Ghost buttons use a subtle gray background (#F1F5F9) on hover rather than a border.
- **Input Fields:** Use #FFFFFF backgrounds with #E2E8F0 borders. On focus, the border transitions to #4D82C3 with a soft 4px outer glow.
- **Cards:** Essential for the "File Info" and "Transfer" views. Cards must have a 24px corner radius and a 1px #F1F5F9 border to define them against the #F8FAFC background.
- **Progress Bars:** Use a thick 8px track with a rounded cap. Use a gradient from #4D82C3 to #7FA7D6 for the active state to imply motion and intelligence.
- **Drop Zones:** Large, dashed-border containers with a light blue tint (#F0F7FF) when active.
- **Chips/Badges:** Small, high-contrast labels for file types (e.g., PDF, ZIP) using secondary blues or functional colors.