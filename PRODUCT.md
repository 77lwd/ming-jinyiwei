# Product

## Register

product

## Platform

Desktop-first web game. The current implementation targets a keyboard-and-mouse desktop reading experience; mobile adaptation and PWA work are outside the active plan.

## Users

Players who want a long-form historical mystery game in which they read scenes, inspect concrete facts, make bounded investigative choices, and live with visible consequences. They are here to inhabit the work of a junior Jinyiwei officer, not to optimize an abstract resource loop.

## Product Purpose

`文字游戏` lets the player experience a chapter-based investigation from the perspective of Liao Weida, an ordinary Jinyiwei xiaowei. The game combines scene reading, evidence-led casework, procedural limits, and a small number of meaningful choices. Success means the player always understands the current situation, what they can responsibly do, and why a result followed, while the larger truth emerges only through confirmed story beats.

## Brand Personality

Restrained, observant, tense.

The interface should feel like working through a living case, not browsing a themed dashboard. It should leave room for scene writing and evidence, make procedural pressure legible, and let consequences land before asking the player to move on.

## Anti-references

- Mobile-game energy meters, gacha framing, storefront UI, reward popups, and repetitive "claim" interactions.
- A dense stat wall that turns the player into an optimizer before they understand the case.
- Generic "ancient style" decoration, faux parchment overload, ornate borders, or props that do not improve reading or investigation.
- Purple-gradient AI-tool aesthetics, glass panels, floating-card grids, and neon status colors.
- A visual-novel flow where every interaction is just a differently labeled "next" button.

## Design Principles

1. **The case is the primary interface.** Current scene, concrete facts, and the next consequential decision take priority over permanent system chrome.
2. **Reading needs room.** Long-form Chinese narrative is a first-class interaction: controlled line length, clear paragraph rhythm, readable dialogue, and unambiguous continuation points.
3. **Show procedural limits through context.** The UI distinguishes what Liao can inspect or propose from what requires approval; it does not invent authority through controls or numbers.
4. **Consequences deserve a pause.** After a choice, show the immediate narrative result and any meaningful state change before returning control to the player.
5. **Status follows relevance.** Health, silver, evidence, and relationships surface when they affect the current case. They must not become a noisy incentive loop.

## Accessibility & Inclusion

Baseline: WCAG 2.1 AA for the desktop experience.

- Every interactive element is keyboard reachable with a visible focus state.
- Images retain meaningful alternative text and missing media never blocks reading or progress.
- Body text meets contrast requirements and stays readable at ordinary desktop zoom levels.
- `prefers-reduced-motion` is respected; motion only communicates scene or state changes.
- Color is never the sole signal for a lock, consequence, or current step.
