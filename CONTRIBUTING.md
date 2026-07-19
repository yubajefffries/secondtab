# Contributing to SecondTab

Thanks for considering a contribution. This project aims to be the CRM a small service business actually keeps open in its second tab, and it gets better with every perspective from people who build for (or run) those businesses.

## Ground rules

- **Read `docs/PRD.md` first** for anything beyond a small fix. It is the product's source of truth, including security requirements and build sequencing. PRs that contradict it need a discussion issue first.
- **Schema changes are migrations.** Every change to the database lands as a new file in `supabase/migrations/`, written expand/contract style. Never edit an existing migration that has shipped.
- **Every table ships with RLS.** A new table without a deny-by-default policy will not be merged.
- **Match the design system.** Use the semantic tokens in `app/globals.css` (`bg-surface`, `text-muted`, `border-border`, ...). No hard-coded colors. Components live in `components/ui` and extend shared primitives; don't restyle third-party components per page.
- **Accessibility is not optional.** Keyboard path for every pointer interaction, visible focus, accessible names on icon-only buttons, WCAG 2.2 AA contrast in both themes.

## Workflow

1. Fork and branch from `main`.
2. `npm install && npm run dev` (demo mode needs no configuration).
3. Make your change; keep PRs focused and small enough to review in one sitting.
4. `npm run lint && npm run build` must both pass.
5. Open a PR describing what changed and how you verified it.

## Contributor License Agreement

To keep future licensing options open (see PRD §15), external contributions require agreeing to a standard CLA. The CLA bot will prompt you on your first PR.

## Not sure where to start?

Check issues labeled `good first issue`, or pick from the "Good first areas" list in the README. Opening an issue to say "I run a [kind of business] and this flow doesn't match reality" is also a first-class contribution.
