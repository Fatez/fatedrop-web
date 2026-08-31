-- Additive multi-TCG scope for the one shared FateMatch engine.
-- Every pre-existing FateMatch predates multi-TCG production and is therefore Pokémon.
ALTER TABLE fatedrop_fate_matches
  ADD COLUMN IF NOT EXISTS tcg_code text NOT NULL DEFAULT 'pokemon';

ALTER TABLE fatedrop_hosted_fate_matches
  ADD COLUMN IF NOT EXISTS tcg_code text NOT NULL DEFAULT 'pokemon';

UPDATE fatedrop_fate_matches
SET tcg_code = 'pokemon'
WHERE NULLIF(BTRIM(tcg_code), '') IS NULL;

UPDATE fatedrop_hosted_fate_matches
SET tcg_code = 'pokemon'
WHERE NULLIF(BTRIM(tcg_code), '') IS NULL;

CREATE INDEX IF NOT EXISTS fatedrop_fate_matches_tcg_active_idx
  ON fatedrop_fate_matches (tcg_code, enabled, updated_at DESC);

CREATE INDEX IF NOT EXISTS fatedrop_hosted_fate_matches_tcg_time_idx
  ON fatedrop_hosted_fate_matches (tcg_code, matched_at DESC);
