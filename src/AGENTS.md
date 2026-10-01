# Project conventions

- Organize product code by feature under `features/<feature>/`.
- Keep feature pages as composition components. Place section UI in `components/`, state and effects in `hooks/`, and pure calculations in `utils/` within the feature that owns them.
- Keep routing and the application shell in `app/`. Put genuinely shared fixtures, types, and formatting utilities in `shared/`.
- Keep global styles in `index.css`, shell styles in `app/styles/`, and feature styles within each feature.
- Preserve existing fields, sections, data, and behavior unless the user requests changes.
- Pass visual variants explicitly; do not select styling by display text.
- Use `npm run format` after edits. Run `npm run format:check`, `npm run lint`, `npm test`, and `npm run build` before completing structural changes.
- Add focused tests for domain logic and boundary cases; avoid tests that merely duplicate markup.
