---
name: Organic Vitality
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#a43a3a'
  on-tertiary: '#ffffff'
  tertiary-container: '#fc7c78'
  on-tertiary-container: '#711419'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#842225'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  slate-text: '#64748B'
  pure-white: '#FFFFFF'
  glass-fill: rgba(255, 255, 255, 0.7)
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter-mobile: 16px
  gutter-desktop: 24px
  margin-safe: 20px
  container-max: 1280px
---

## Brand & Style
The design system for this e-grocery platform centers on a "Fresh-Tech" aesthetic—merging the organic nature of produce with the high-efficiency expectations of modern quick-commerce. The brand personality is rooted in trustworthiness and eco-consciousness, achieved through high-clarity layouts and a commitment to sustainable visual metaphors.

The visual style is **Modern Glassmorphic**. This approach utilizes translucent layers and soft background blurs to maintain a sense of depth and airiness. It is paired with 3D organic illustrations that provide tactile warmth, breaking the sterility of traditional digital interfaces. Micro-interactions should feel viscous and natural, reinforcing the "Fresh" narrative of the brand.

## Colors
The palette is dominated by **Emerald Green**, used strategically for primary actions and "freshness" indicators. The background is a clean **Off-White**, reducing eye strain and providing a crisp canvas for colorful product photography. 

**Deep Charcoal** serves as the foundation for typography to ensure maximum legibility and a sense of authority. A **Slate Blue-Gray** is utilized for secondary metadata and disabled states. Glassmorphism effects should use the `glass-fill` variable with a background blur of 12px to 20px to create the signature "frosted" look without sacrificing accessibility.

## Typography
**Outfit** is the sole typeface for this design system. Its geometric yet friendly construction aligns perfectly with the modern, efficient brand persona. 

Large display titles should use heavy weights and slight negative letter-spacing to feel impactful and "editorial." Body text maintains a standard 16px base for high legibility during quick browsing. Label styles use semi-bold weights to ensure functional clarity in high-density areas like product grids and checkout summaries.

## Layout & Spacing
The design system employs a **Fluid Grid** model based on an 8px rhythmic scale. 

- **Mobile:** 4-column grid with 16px gutters and 20px side margins. 
- **Tablet:** 8-column grid with 20px gutters.
- **Desktop:** 12-column grid with a maximum container width of 1280px and 24px gutters.

Spacing should prioritize "breathing room" around product imagery to avoid a cluttered supermarket feel. Use dynamic padding for immersive header sections that scale based on device height.

## Elevation & Depth
Depth is conveyed through a combination of **Glassmorphism** and **Ambient Shadows**. 

1. **Surface Level (0):** The off-white background.
2. **Card Level (1):** Low-opacity, diffused shadows (Y: 4, Blur: 20, Color: 0F172A @ 5%) to lift product cards.
3. **Glass Level (2):** Sticky headers and floating action buttons use a 70% white fill with a 16px backdrop blur and a 1px inner "shine" border (pure white @ 20%).
4. **Modal Level (3):** Deep, wide shadows for overlays to pull the user's focus.

Textured headers should use a subtle grain or organic noise overlay to provide a tactile, high-end feel.

## Shapes
In line with the "organic" and "friendly" brand traits, the design system utilizes generous roundedness. 

Standard components (buttons, inputs) use **0.5rem (8px)**. Product cards and large containers use **rounded-xl (1.5rem / 24px)** to create a soft, modern container. Progress indicators and chips utilize the **pill-shape** for a distinct "active" look.

## Components

### Buttons
Primary buttons are Emerald Green with bold white text and a subtle drop shadow. Secondary buttons use a glass effect or a ghost-style border. Interaction states should include a slight "squeeze" (scale-down) on press.

### High-Density Product Cards
Cards feature a large image area, a price badge in the top right, and a "Quick Add" (+) button in the bottom right using the primary green. The card background is pure white to contrast against the off-white page background.

### Sticky Headers
Implemented with glassmorphism. Content behind the header should be visible but blurred. Includes a location picker and a search bar with an inset shadow.

### Progress Trackers
Used for order tracking. Use a "connecting vine" metaphor instead of a standard line. Completed steps use a pulsating emerald green dot to indicate live movement.

### Input Fields
Inputs are large (48px-56px height) with soft 8px corners. Focus states use a 2px emerald green outer ring.

### Textured Headers
Category landing pages should feature immersive headers with 3D produce illustrations and a subtle paper or organic linen texture background to evoke a "premium market" feel.