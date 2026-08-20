# Canonical alert intelligence branch

This isolated feature branch validates the canonical FateDrop alert inbox without changing production deployment or database schema.

The mobile alerts API reads existing `fatedrop_signals`, canonical RRP from `fatedrop_products`, and same-product live offers from `fatedrop_retail_offers`. It separates RRP markup from delivery comparison, never assumes unknown postage is free, and emits a shared price-intelligence and notification payload for app/web/push consumers.
