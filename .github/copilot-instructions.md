# IAstroMatch Frontend – Cyberpunk UI/UX Guidelines

> This document defines the visual language and UX rules for the **Cyberpunk** universe version of IAstroMatch.  
> **Goal:** the site must feel like a real dating platform running in a dark, neon-soaked, megacorp-controlled future, not just a normal site with purple colors.

---

## 1. Core Experience Pillars

1. **Clandestine but high-tech** – Feels like a black-market intergalactic Tinder running in the back alleys of a mega-city.
2. **Data everywhere** – Subtle HUD overlays, metrics and tags around profiles (risk level, corp, species, threat index).
3. **Oppression + rebellion** – UI hints that a megacorp owns the platform, but users try to bypass it (glitches, warnings, hacked badges).
4. **AI is a character** – The "IA de compatibilité intergalactique" is visible, named, with a personality: cold, slightly cynical, efficient.

Everything in the UI (colors, copy, motion) should support these four ideas.

---

## 2. Color System

Define colors as design tokens (CSS variables or theme object). All components must consume the tokens, not hard-coded hex.

**Primary Palette** (dark base, neon accents):

- **Background main:** near-black with a hint of blue or magenta (ex: `#050712` to `#050914`).
- **Surface panels:** layered darks (`#0b1020`, `#111629`, `#161b33`) for depth.
- **Primary neon:** cyan / teal (buttons, key CTAs, primary neon lines).
- **Secondary neon:** magenta / purple.
- **Alert neon:** toxic yellow or red for danger / "match risqué".

**Usage Rules:**

1. Background must always be dark; no white sections.
2. Neon colors are used only on edges, text highlights, outlines and glows; never flood the whole screen.
3. Each main screen has one dominant neon (cyan) and one support neon (magenta). Tertiary colors are used only for small tags and data chips.

---

## 3. Typography

Overall feel: **techno, readable, dense**.

1. Use a geometric or sci-fi display font for titles (ex: Orbitron, Audiowide, Russo One, or similar Google font).
2. Use a clean grotesk/sans for body (ex: Inter, Roboto, Space Grotesk).
3. Titles are uppercase with increased letter-spacing; body text stays sentence-case for readability.
4. Numerals in stats / scores must use a monospaced or tabular variant to feel "system UI".

**Typographic Scale Example:**

- **H1** (page title): 30–40px, bold, neon gradient or outline.
- **H2** (section title): 22–26px.
- **Body:** 14–16px.
- **Meta / tags:** 11–12px, all caps, tracking wide.

---

## 4. Layout & Composition

Layout direction: **dashboard + holographic cards**.

1. Use a **three-layer depth:** background city/noise, translucent panels, foreground cards/chips.
2. Prefer **card-based layouts** with hard edges but neon outlines or inner glows.
3. Keep content density higher than a normal modern site: more visible data, but chunked into clear blocks to avoid chaos.
4. Use angled dividers, diagonal edges or subtle skew transforms to break the "flat rectangle" feeling.
5. Navbar must feel like a fixed HUD bar: slim, dark, with neon underline for the active section.

**Mobile:**

- Maintain the same depth: city/noise background stays, cards stack with drop-shadow + glow.
- Sticky bottom bar is allowed for primary actions (swipe / match / open AI assistant).

---

## 5. Key Screens – Cyberpunk Styling Notes

### 5.1 Landing / Home

1. Immediate mood: dark city background (can be static image or gradient with rain/noise overlay), big neon logo "IAstroMatch".
2. Hero section must show: tiny holographic avatars, flickering text like "Connecting 4 392 102 lifeforms…".
3. Main CTA button: neon cyan glow, small animated scan line moving across on hover.
4. Secondary CTA (e.g. "Enter as Guest", "View Galactic Feed"): outlined magenta.

### 5.2 Profile Creation Flow

1. Multi-step "system console" feel: progress indicator looks like a segmented neon bar or circuit line.
2. Inputs must be framed as **data fields:** label in tiny mono font, value in normal font, optional small icon (DNA, planet, interface port, etc.).
3. Group fields into cards: "Environment" (atmosphere, gravity), "Morphology", "Faction / Corp", "Intent" (love / treaty / conquest).
4. Use pill tags with neon borders for multi-select options (e.g. "Breathes Methane", "Quantum-Linked", "Synthetic Body").
5. Error states: glitch animation (small shake + red scan line) instead of standard red text only.

### 5.3 Matching / Suggestions

1. Profile cards must feel like **holographic dossiers:** photo/illustration, badges (species, corp, risk), and AI score.
2. Show a visible compatibility score: percentage + label ("HIGH RISK – HIGH ATTRACTION", "STABLE ALLIANCE", "DIPLOMATIC INCIDENT LIKELY").
3. Display small animated elements: scanning line moving over the avatar, data flickering in the corner.
4. Actions: "Connect", "Flag as Threat", "Open Diplomatic Channel". Buttons styled as physical toggles with neon frame.

### 5.4 Chat / First Contact

1. Chat window appears as a secured encrypted channel: frame with status label like `[ENCRYPTION: QUANTUM]`.
2. Messages bubbles are slightly transparent with subtle RGB split at edges.
3. System/AI messages must clearly differ: mono font, prefixed by `//`, maybe tinted yellow.
4. Optional: small "line noise" animation in the background of the chat pane to keep the screen alive.

---

## 6. Components & Patterns

### 6.1 Buttons

1. **Primary:** filled dark rectangle with neon outer glow and slight inner gradient; hover adds stronger glow + scale 1.02.
2. **Secondary:** transparent with neon outline; hover fills with faint neon tint.
3. **Danger:** same style but using alert color; use for "Erase Trace", "Cut Transmission".

All button states (default / hover / pressed / disabled) must be defined in the design tokens.

### 6.2 Cards

1. Always use multi-layer: background blur or city texture, semi-transparent card, thin neon border.
2. Corners slightly rounded (4–8px) but emphasize digital feel with inner strokes or split corners (one corner cut off or highlighted).
3. Each card has a header row with icon + title + subtle line of system metadata (ID, last scan, sector).

### 6.3 Form Inputs

1. Dark fields with bottom neon line that animates when focused.
2. Placeholder text uses muted grey; real data uses brighter color.
3. Checkbox/radio become toggles or mini-chips; avoid default browser style.

### 6.4 Badges & Tags

1. Small pills for: SPECIES, FACTION, ALIGNMENT, DANGER LEVEL, ENVIRONMENT.
2. Tag colors: neutral for environment, neon magenta for emotional, yellow/red for danger.

---

## 7. Motion & Micro-Interactions

Animation style: **short, sharp, electronic**.

1. Use 150–250ms duration for most UI transitions; use cubic-bezier easing that feels "snappy".
2. Add subtle **glitch effects** on: AI responses appearing, match results, login errors (RGB split, quick jitter, clipping mask).
3. Screen transitions can use directional wipes or "data loading" bars rather than soft fades.
4. Avoid excessive motion on every element at once; pick 1–2 animated accents per screen.

---

## 8. AI Presence (UX Rules)

1. The AI module must always be reachable via a persistent icon (e.g. holographic orb) in the corner.
2. Its panel opens as a side console overlay, not a generic chatbot bubble.
3. AI responses must explicitly reference data: "Based on your low-gravity tolerance and diplomatic alignment, I rate this match as…".
4. Tone: dry, slightly sarcastic, but never hostile; it's clearly a corporate product, not your friend.
5. Visual identity: fixed color (e.g. neon yellow) so users recognize "AI messages" instantly.

---

## 9. Accessibility in a Dark / Neon UI

1. Minimum contrast ratio: ensure neon text on dark backgrounds passes WCAG (avoid neon text directly on photos).
2. Never use pure saturated neon on pure black for body text; reserve that for small labels and accents.
3. Provide a "reduced FX" toggle: when enabled, remove glitch animations and heavy motion.
4. Focus states must be obvious even without glow (extra border or underline).

---

## 10. Sound (Optional but Recommended)

If audio is implemented:

1. Short UI blips for match success, warning, and AI response.
2. Sounds must be synthetic / electronic, not realistic clicks.
3. Provide global mute control in the header or settings.

---

## 11. Implementation Notes for Frontend Devs

1. **Centralize theme:** Create a single config (e.g. `theme/cyberpunk.ts` or CSS variables on `:root`); all components read from there.
2. **Reusable primitives:** `NeoButton`, `NeoCard`, `NeoTag`, `ConsolePanel`, `GlitchText`. No ad-hoc styling.
3. **Background layer:** Global component (e.g. `NeonCityBackground`) with noise + optional parallax; never re-implemented per page.
4. **Class name consistency:** Use semantic tokens (`btn-primary`, `card-surface`, `text-meta`) instead of colors in names.
5. **Design validation:** Any new UI element must answer: "What makes this cyberpunk?" (color, shape, motion, copy or data density). If nothing, re-design.

---

## 12. Tone & Microcopy Examples

- **Generic button:** "Enter the Grid" instead of "Get Started".
- **Error:** "Signal jammed. Check your input and try again."
- **Loading:** "Decrypting galactic profiles…"
- **No results:** "No compatible lifeform found in this sector. Expand your parameters or hack another quadrant."

All text must support the feeling of a dense, surveilled but seductive cyberpunk dating grid.

---

## 13. When Adding New Features

1. **Ask:** Does this feature fit the cyberpunk narrative and core pillars?
2. **Design:** What neon colors, typography, and animation style does it use?
3. **Code:** Is it using theme tokens and reusable components?
4. **Copy:** Does the microcopy feel immersive and on-brand (dry, tech, slightly dystopian)?
5. **Test:** Does it pass accessibility standards and feel snappy on mobile?

---
