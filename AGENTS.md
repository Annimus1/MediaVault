# AGENTS.md

Personal media-tracking API: Node/Express + Mongoose, TypeScript ESM. No frontend, no CI, no lint/format config.

## Commands

- `npm run dev` — start API with `tsx watch` (`src/index.ts`)
- `npx tsc --noEmit` — typecheck (there is no lint script; `npm run build` also typechecks)
- `npm run build` then `npm start` — production: `tsc` to `dist/`, then `node dist/index.js`
- `npm test` — Jest + supertest against a **real MongoDB** (`CONNECTION_STRING`), not mocks
- `npm test -- --runInBand` — use this; suites open/close the DB connection and mutate data, so parallel files race
- `npm test -- tests/media.test.ts --runInBand` / `npm test -- --runInBand -t "login"` — single file / single test

## Environment

Required in `.env` (gitignored): `SECRET_KEY`, `CONNECTION_STRING`. `GEMINI_API_KEY` for recommendations, `FRONTEND_URL` for CORS.

- `dotenv` is loaded only as a side effect of importing `src/app.ts` (via `auth.route.ts`'s `import 'dotenv/config'`).
- `src/db/mongo.ts` reads `CONNECTION_STRING` at module load. Import `app` (or `dotenv/config`) **before** `db/mongo` in entrypoints and tests. `src/index.ts` does this correctly.
- Tests use the real database and clean up their own users/tokens; never point them at production data.

## ESM import rule

Relative imports in `.ts` files must keep the `.js` extension (`./parser.js`), including type imports. `jest.config.js` maps `.js` back to `.ts`. Do not remove the extensions.

## Routing

All routes mount at `/api/v1` in `src/app.ts`. The auth router re-mounts itself at `'/auth'`, so endpoints are `/api/v1/auth/login` and `/api/v1/auth/register`. Register new routers in `app.ts` **before** `mediaRoutes`, because `media.route.ts` has a catch-all `GET/PUT/DELETE /:id` that would swallow other single-segment paths.

## API conventions / gotchas

- Auth header is `Authorization: Bearer <token>` (README's `Application-Authorization` is wrong). Middleware checks both JWT signature and that the token still exists in the `AuthToken` collection.
- Login/register return `{ token }` at the top level, not `{ status, data }`. `logout` is a stub returning 501.
- `parseMedia` requires **all seven** keys, including optional-looking `comment`; omitting any key yields 400.
- `mediaType`/`language` are validated case-insensitively but stored lowercase. Valid values live in `src/utils/enums.ts` (`movie|serie|anime|videogame|book`, `spanish|english|sub-spanish`).
- List pagination/filtering happens in memory: `getMedia` fetches all of a user's docs (its `skip` arg is unused), then `LimitElements`/`filteredMedia` paginate/filter.
- `GET /api/v1/recommendations` is behind `authMiddleware`. It requests up to 10 candidates from Gemini (`gemini-3-flash-preview`) via the `IaProvider` singleton (`src/utils/IaProveiders/`), validates the JSON, resolves covers for Rotten Tomatoes / Open Library, discards every item without a verified cover, and returns at most 5. Books must include an ISBN; Open Library covers are checked via `HEAD` with `?default=false` because missing covers otherwise return a placeholder. No history → 400; provider/parse failure → 502.
- Recommendation parsing lives in `src/utils/recommendations.ts`; `tests/recommendations.test.ts` mocks both the AI provider and poster resolution, while `tests/posters.test.ts` mocks Axios. Do not let these tests call Gemini or the network.

## Response/DB shapes

Mongoose documents are returned with `_id`; media queries project `owner name completedDate score poster mediaType language comment`. `Media.owner` is currently declared as `Object` in the schema, while `AuthToken.owner` is an `ObjectId` ref to `User`.
