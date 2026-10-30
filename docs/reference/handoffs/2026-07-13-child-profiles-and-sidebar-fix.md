# Handoff: child profiles and Filament sidebar correction

- Build package: P1.3
- Date: 2026-07-13
- Status: backend/admin slice complete

## Outcome

Filament navigation groups are permanently expanded and their dropdown affordances are removed. The Filament 5 active-item selector now applies TinkerPod teal with white icon/text instead of the framework white state.

Parents can create, list, view, update and archive child profiles. PINs are optional, hashed and never serialized. Child age bands are derived from date of birth. Admins can manage child records through a new Children resource without PIN visibility or hard-delete bulk actions.

## Verification

- `php artisan test --compact`: 10 tests, 38 assertions passed.
- Cross-household view and archive requests return 403.
- `npm run build`: production theme compiled.
- Pint formatted all changed PHP files.

## Next

Connect child creation to Expo, then implement P1.3A Pod recommendation and membership with the five seeded launch Pods.
