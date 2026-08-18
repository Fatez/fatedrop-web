-- FateLock is not public UI. This function is groundwork for real retailer-backed allocations only.
CREATE OR REPLACE FUNCTION fatedrop_create_reservation(
  p_reservation_id text,
  p_allocation_id text,
  p_user_id text,
  p_quantity bigint,
  p_idempotency_key text,
  p_reserved_at bigint,
  p_expires_at bigint
) RETURNS TABLE(reservation_id text, reservation_state text, created boolean)
LANGUAGE plpgsql
AS '
DECLARE
  allocation_row fatedrop_stock_allocations%ROWTYPE;
  existing_row fatedrop_reservations%ROWTYPE;
  active_user_quantity bigint;
BEGIN
  IF p_quantity <= 0 THEN RAISE EXCEPTION ''INVALID_QUANTITY''; END IF;
  IF p_expires_at <= p_reserved_at THEN RAISE EXCEPTION ''INVALID_EXPIRY''; END IF;

  SELECT * INTO existing_row FROM fatedrop_reservations WHERE idempotency_key = p_idempotency_key;
  IF FOUND THEN
    IF existing_row.user_id <> p_user_id OR existing_row.allocation_id <> p_allocation_id OR existing_row.quantity <> p_quantity THEN
      RAISE EXCEPTION ''IDEMPOTENCY_CONFLICT'';
    END IF;
    RETURN QUERY SELECT existing_row.id, existing_row.state, false;
    RETURN;
  END IF;

  SELECT * INTO allocation_row FROM fatedrop_stock_allocations WHERE id = p_allocation_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION ''ALLOCATION_NOT_FOUND''; END IF;
  IF allocation_row.state <> ''open'' THEN RAISE EXCEPTION ''ALLOCATION_NOT_OPEN''; END IF;
  IF allocation_row.opens_at IS NOT NULL AND p_reserved_at < allocation_row.opens_at THEN RAISE EXCEPTION ''ALLOCATION_NOT_OPEN''; END IF;
  IF allocation_row.closes_at IS NOT NULL AND p_reserved_at >= allocation_row.closes_at THEN RAISE EXCEPTION ''ALLOCATION_CLOSED''; END IF;

  SELECT COALESCE(SUM(quantity),0) INTO active_user_quantity
  FROM fatedrop_reservations
  WHERE allocation_id = p_allocation_id AND user_id = p_user_id AND state IN (''reserved'',''claimed'');

  IF active_user_quantity + p_quantity > allocation_row.per_user_limit THEN RAISE EXCEPTION ''USER_LIMIT_EXCEEDED''; END IF;
  IF allocation_row.quantity_reserved + p_quantity > allocation_row.quantity_allocated THEN RAISE EXCEPTION ''ALLOCATION_EXHAUSTED''; END IF;

  INSERT INTO fatedrop_reservations (id,allocation_id,user_id,quantity,state,idempotency_key,reserved_at,expires_at,updated_at)
  VALUES (p_reservation_id,p_allocation_id,p_user_id,p_quantity,''reserved'',p_idempotency_key,p_reserved_at,p_expires_at,p_reserved_at);

  UPDATE fatedrop_stock_allocations
  SET quantity_reserved = quantity_reserved + p_quantity,
      state = CASE WHEN quantity_reserved + p_quantity >= quantity_allocated THEN ''exhausted'' ELSE state END,
      updated_at = p_reserved_at
  WHERE id = p_allocation_id;

  INSERT INTO fatedrop_reservation_events (id,reservation_id,event_type,from_state,to_state,occurred_at,metadata_json)
  VALUES (p_reservation_id || '':created'',p_reservation_id,''created'',NULL,''reserved'',p_reserved_at,jsonb_build_object(''quantity'',p_quantity));

  RETURN QUERY SELECT p_reservation_id, ''reserved''::text, true;
END;
';
