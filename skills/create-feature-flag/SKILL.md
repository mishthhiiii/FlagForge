# create-feature-flag

Production skill for adding a new feature flag to FlagForge across backend and frontend.

## Purpose

Guide the coding agent through creating a new feature flag entry that conforms to FlagForge's Prisma schema, Express API, Zod validation, and React UI patterns. Ensures consistent naming, environment state initialization, and verification steps.

## Trigger

Activate when the user request contains any of:

- create feature flag
- add feature flag
- new flag
- add flag
- create-flag

## Inputs

- `flagKey` (string, required) — Unique kebab-case identifier within the project (e.g., `dark-mode-sunset-schedule`)
- `flagName` (string, required) — Human-readable display name
- `flagType` (enum, optional) — One of `BOOLEAN`, `MULTIVARIATE`, `JSON`. Default: `BOOLEAN`
- `description` (string, optional) — Flag description shown in the UI
- `projectId` (uuid, required for API) — Target project UUID for backend creation
- `defaultEnabled` (boolean, optional) — Whether development environment starts enabled. Default: `false`

## Execution Steps

1. **Validate inputs** — Confirm `flagKey` matches `/^[a-zA-Z0-9-_]+$/` per `createFlagSchema` in `backend/backend/src/validators/flag.validator.ts`
2. **Check uniqueness** — Verify no existing flag with the same key in the target project (Prisma `@@unique([projectId, key])`)
3. **Backend: create via API** — POST to `/api/flags` with body:
   ```json
   {
     "name": "<flagName>",
     "key": "<flagKey>",
     "description": "<description>",
     "type": "<flagType>",
     "projectId": "<projectId>"
   }
   ```
4. **Backend: verify service behavior** — Confirm `FlagService.createFlag` creates `EnvironmentFlagState` rows for each project environment with appropriate default values (`false`, `control`, or `{}` by type)
5. **Frontend (if UI listing needed)** — Ensure flag appears in `frontend/src/pages/FeatureFlags.tsx` when connected to live API; update `frontend/src/types/index.ts` only if new fields are introduced
6. **Audit log** — Confirm an audit log entry is written for `CREATE_FLAG` action
7. **Test** — Run `npm run typecheck` in frontend and `npm run build` in backend/backend

## Expected Output

A structured report containing:

- Flag metadata (key, name, type, projectId)
- Backend API response confirmation or checklist if dry-run
- List of environment states created (dev/staging/prod)
- Verification command results (typecheck/build exit codes)
- Any manual follow-up items (e.g., targeting rules, rollout configuration)

Example:

```
Feature flag created: dark-mode-sunset-schedule
- Type: BOOLEAN
- Environments initialized: 3
- Backend build: passed
- Frontend typecheck: passed
- Audit log: CREATE_FLAG recorded
```
