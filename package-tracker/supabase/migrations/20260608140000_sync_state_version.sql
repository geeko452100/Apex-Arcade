-- Align denormalised state_version / turn_owner with the authoritative status jsonb.
UPDATE public.games
SET
  state_version = COALESCE((status->>'stateVersion')::integer, 0),
  turn_owner    = COALESCE((status->>'turnOwner')::uuid, turn_owner)
WHERE state_version IS DISTINCT FROM COALESCE((status->>'stateVersion')::integer, 0)
   OR (status ? 'turnOwner' AND turn_owner IS DISTINCT FROM (status->>'turnOwner')::uuid);
