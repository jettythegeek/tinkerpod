# Task specification: child profiles and ownership

- Build package: `P1.3`
- Owner/agent: Codex
- Date: 2026-07-13
- Relevant PRD sections: 4, 7, 11–13, 15
- Focused specifications: backend, database, API, security and child safety

## User outcome

An authenticated parent can create, list, view, update and archive their child profiles without being able to discover or change another household’s children.

## Scope

- Child schema/model/factory, optional hashed PIN, derived age band, ownership policy, parent API CRUD, Filament resource, OpenAPI and feature tests.

## Non-goals

- Pod recommendation, subscriptions, avatar uploads, permanent deletion, or child-mode switching.

## Acceptance criteria

- [ ] A parent can manage only their own child profiles.
- [ ] PIN is hashed and never serialized.
- [ ] Cross-parent view/update/archive attempts return 403.
- [ ] Archived profiles remain recoverable and are not hard-deleted.

## Verification plan

- Automated: migrations, feature tests, full PHP tests and Pint.
- Security: explicit cross-household tests and hidden PIN assertion.
