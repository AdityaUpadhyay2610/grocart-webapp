---
name: Organic Vitality Nocturnal
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b4b4'
  tertiary: '#ffb3af'
  on-tertiary: '#650911'
  tertiary-container: '#fc7c78'
  on-tertiary-container: '#711419'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#842225'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  surface-border: '#262626'
  text-primary: '#ffffff'
  text-secondary: '#a3a3a3'
  glass-stroke: rgba(255, 255, 255, 0.1)
  accent-glow: rgba(16, 185, 129, 0.2)
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
  base-unit: 4px
  gutter-mobile: 16px
  gutter-desktop: 24px
  margin-safe: 20px
  container-max: 1280px
---

## Brand & Style

The design system evolves into a premium, high-performance dark aesthetic. It retains the "Fresh-Tech" core—bridging the gap between organic sustainability and digital efficiency—but shifts the emotional response toward luxury, exclusivity, and focused vitality. The target audience is the discerning, tech-savvy consumer who values health and high-end aesthetics.

The chosen design style is **Minimalist Glassmorphism**. This approach leverages the deep charcoal base to create a sense of infinite depth. By using translucent surfaces and precise emerald accents, the UI feels like a sophisticated digital tool. The "organic" element is maintained through high-quality product photography and soft, rounded corners, while the dark environment eliminates visual noise, placing the spotlight entirely on the vibrant colors of fresh produce.

## Colors

The palette is anchored by a **Deep Charcoal (#0a0a0a)** background, providing a rich, "ink-pool" canvas that maximizes the contrast of the **Emerald Green (#10B981)** primary accent. This green is used sparingly for high-priority calls to action and success states, often accompanied by a subtle glow to simulate vitality.

Surfaces and containers utilize **Dark Grey (#171717)** to create subtle hierarchy against the background. Typography follows a strict hierarchy: **Crisp White (#ffffff)** for headlines to ensure immediate readability, and **Muted Grey (#a3a3a3)** for body and secondary metadata to reduce cognitive load in dark environments. Borders and dividers use a precise **Charcoal Grey (#262626)** to define structure without breaking the seamless dark aesthetic.

## Typography

The design system exclusively uses **Outfit**. Its geometric construction provides a technical precision that complements the dark theme, while its open apertures maintain a friendly, approachable feel even at small sizes.

Headlines are set with significant weight to pierce through the dark background, acting as visual anchors. Negative letter-spacing on display sizes creates a tight, editorial look common in premium applications. Body text is optimized for readability with a generous 1.5x line height, ensuring that long descriptions remain legible against the high-contrast background. Secondary labels use a slightly increased letter-spacing to prevent "glow-clumping" in low-light environments.

## Layout & Spacing

This design system utilizes a **Fluid Grid** based on an 8px rhythmic scale. The layout philosophy centers on "The Spotlight Effect"—using generous margins and negative space to isolate product imagery, making fruits and vegetables appear like vibrant jewels against the dark void.

- **Mobile:** 4-column fluid grid with 16px gutters and 20px side margins.
- **Tablet:** 8-column grid with 20px gutters for increased information density.
- **Desktop:** 12-column grid capped at 1280px. 

Vertical spacing should be expansive. Large section breaks (64px+) are encouraged to maintain a premium, uncrowded feel. Components should use the base 4px unit for internal padding to maintain a tight, technical alignment.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Glassmorphism**. In a dark environment, traditional shadows are replaced by subtle luminosity and "inner glows."

1. **Floor (0):** The base background (#0a0a0a).
2. **Elevated Surfaces (1):** Containers (#171717) with a 1px solid border (#262626).
3. **Floating Glass (2):** Sticky headers and navigation bars use a semi-transparent fill (rgba(23, 23, 23, 0.8)) with a 20px backdrop blur and a thin white top-stroke (10% opacity) to catch "light" from above.
4. **Active Interaction (3):** Primary buttons and active states feature a soft Emerald Green outer glow (Blur 15px, Opacity 20%) to indicate energy and life.

Depth is further enhanced by desaturating background elements and increasing the saturation of foreground product photography.

## Shapes

The shape language is consistently **Rounded**, striking a balance between technical precision and organic softness. 

Standard interactive elements like buttons and inputs use a **0.5rem (8px)** radius. Larger structural components, such as product cards and modals, use a more generous **1.5rem (24px)** radius to soften the edges of the dark containers. Pills are reserved for status indicators and high-visibility tags (e.g., "Organic" or "Sale"), providing a distinct visual silhouette that separates metadata from functional UI elements.

## Components

### Buttons
Primary buttons are solid Emerald Green (#10B981) with Black text for maximum punch. Secondary buttons use a "Ghost" style: a 1px border (#262626) with white text, transitioning to a subtle grey fill on hover.

### Product Cards
Cards are built on #171717 surfaces. The image container should have a subtle gradient mask at the bottom to transition the photo smoothly into the card surface. The "Add to Cart" (+) button is a floating pill in the bottom right corner, utilizing the primary green.

### Input Fields
Inputs are deep charcoal (#0a0a0a) with a subtle #262626 border. On focus, the border transitions to Emerald Green with a soft outer glow. Placeholder text is muted grey (#525252).

### Chips & Badges
Status chips use low-opacity versions of the status color (e.g., Green @ 10% fill) with a high-saturation label to maintain readability without overwhelming the dark theme.

### Sticky Navigation
The bottom navigation bar (mobile) or top header (desktop) uses the Glass Level elevation. Icons should be line-art style (2px stroke) in white, turning emerald green when active.

### Lists & Dividers
List items are separated by 1px dividers in #262626. For interactive lists, the entire row should transition to #1f1f1f on hover to provide clear tactile feedback.