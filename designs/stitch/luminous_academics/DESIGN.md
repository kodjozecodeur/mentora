---
name: Luminous Academics
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#4d4632'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#7e7760'
  outline-variant: '#d0c6ac'
  surface-tint: '#705d00'
  primary: '#705d00'
  on-primary: '#ffffff'
  primary-container: '#f4ce1a'
  on-primary-container: '#6a5800'
  inverse-primary: '#e9c403'
  secondary: '#8d3c9a'
  on-secondary: '#ffffff'
  secondary-container: '#f59aff'
  on-secondary-container: '#772685'
  tertiary: '#605f51'
  on-tertiary: '#ffffff'
  tertiary-container: '#d4d1c0'
  on-tertiary-container: '#5b5a4c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe16f'
  primary-fixed-dim: '#e9c403'
  on-primary-fixed: '#221b00'
  on-primary-fixed-variant: '#544600'
  secondary-fixed: '#ffd6fe'
  secondary-fixed-dim: '#f9acff'
  on-secondary-fixed: '#35003f'
  on-secondary-fixed-variant: '#722180'
  tertiary-fixed: '#e6e3d1'
  tertiary-fixed-dim: '#cac7b6'
  on-tertiary-fixed: '#1d1c11'
  on-tertiary-fixed-variant: '#48473a'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  headline-xl:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Lexend
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Lexend
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
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-padding: 20px
  stack-gap: 16px
---

## Brand & Style

The design system is built to bridge the gap between rigorous educational diagnostics and an engaging, gamified learning experience. The brand personality is **encouraging, intellectual, and vibrantly clear**. It targets students seeking structured revision and diagnostic feedback.

The visual style is a sophisticated blend of **Minimalism** and **Tactile Modernism**. It utilizes heavy whitespace and a restricted color palette to ensure focus, while employing subtle physical metaphors—like "pressable" buttons and soft-shadowed cards—to make the interface feel responsive and friendly. The goal is to evoke a sense of "active clarity," where the UI never feels like a chore, but rather a playful companion in the journey of knowledge.

## Colors

This design system uses a high-energy primary palette balanced by soft, airy background tones.

- **Primary Yellow (#F4CE1A):** Used for primary actions, progress indicators, and highlight accents. It represents energy and optimism.
- **Secondary Purple (#873694):** Used for branding, character elements, and secondary interactive states. It provides a grounded, academic contrast to the yellow.
- **Tertiary Cream (#FDF9E7):** Specifically for speech bubbles and "thought" containers to keep them distinct from standard UI cards.
- **Background Lavender (#F9F7FC):** A very light, tinted off-white that prevents screen fatigue and feels more welcoming than pure white.
- **Functional Colors:** Use a soft emerald for "Correct" states and a warm coral for "Error" states, maintaining the playful yet clear aesthetic.

## Typography

**Lexend** is the sole typeface for this design system. Its design was specifically engineered to reduce visual stress and improve reading speed, making it the perfect choice for an educational app.

- **Headlines:** Use Bold or Semi-Bold weights with tight letter spacing for a punchy, authoritative feel.
- **Body:** Use Medium weight (500) for standard reading to ensure the rounded terminals of the font provide a friendly, approachable texture.
- **Clarity:** Never use light weights. The app must remain highly legible for students under exam-prep pressure.
- **Language Note:** All French typography should respect standard punctuation spacing (e.g., a space before the question mark).

## Layout & Spacing

The layout follows a **fluid grid** model with generous safe areas to maintain an "airy" feel.

- **Mobile:** 4-column grid with 20px side margins and 16px gutters.
- **Tablet/Desktop:** Content is centered in a max-width container (720px for lessons, 1024px for dashboards) to prevent line lengths from becoming unreadable.
- **Vertical Rhythm:** Use the `stack-gap` (16px) for related elements (like a list of options) and `lg` (40px) to separate distinct sections (like the character prompt and the user input area).
- **White Space:** If in doubt, add more space. The diagnostic experience should never feel cluttered or overwhelming.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Tactile Shadows** rather than traditional elevation.

- **Flat Base:** The background is flat.
- **Tactile Cards:** Interactive cards use a 2px solid border in a slightly darker shade of the surface color, plus a "bottom-heavy" shadow (4px offset) to make them look like physical buttons that can be pressed.
- **Active States:** When an element is pressed or selected, the shadow disappears (0px offset) and the element shifts 2px down, simulating a physical click.
- **Character Layer:** The diagnostic character and its speech bubble exist on the highest perceived layer, using a slightly more diffused, soft ambient shadow to appear "above" the curriculum content.

## Shapes

The shape language is consistently **Rounded**, reinforcing the friendly and non-intimidating brand persona.

- **Primary Containers:** Use `rounded-lg` (16px) for lesson cards and speech bubbles.
- **Buttons & Inputs:** Use `rounded-xl` (24px) to create a soft, pill-like appearance that invites interaction.
- **Progress Bars:** Always use fully rounded ends (caps) to ensure the progress feels fluid and organic rather than mechanical.
- **Speech Bubbles:** Include a small, rounded triangular pointer (beak) that connects the bubble to the character icon.

## Components

### Buttons

- **Primary:** Background `#F4CE1A`, text `#1A1A1A`, with a 4px dark-yellow bottom border to simulate depth.
- **Secondary:** Outline style using `#873694` with a 2px stroke.

### Diagnostic Speech Bubbles

- A container with `#FDF9E7` background and `#F4CE1A` border.
- Positioned next to the character avatar.
- Text should be centered or left-aligned depending on length, using `body-lg`.

### Option Cards (Selection)

- Large, full-width cards with `body-md` bold text.
- **Unselected:** White background, light grey border.
- **Selected:** Soft purple background, `#873694` border, 2px downward translation.

### Progress Bars

- **Track:** Semi-transparent lavender or light grey.
- **Indicator:** Solid `#F4CE1A`.
- Height should be 12px or 16px to feel substantial and "rewarding" as it fills.

### Input Fields

- Clean white background, 2px light grey border that turns `#873694` on focus.
- Placeholder text in `label-lg` with a soft grey tint.
