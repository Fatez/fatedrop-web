import type { NetworkInventoryObservation, NetworkLocation, NetworkOffer, NetworkProduct, NetworkProductIdentity, NetworkRetailer, NetworkSignalEvent } from "@/lib/network-domain";
import { fateDropPostgres } from "@/lib/postgres";

export async function upsertNetworkRetailer(retailer: NetworkRetailer) {
  const sql = await fateDropPostgres();
  const now = Math.floor(Date.now() / 1000);
  await sql`INSERT INTO fatedrop_retailers (id,name,website,verification,catalogue_connected,updated_at)
    VALUES (${retailer.id},${retailer.name},${retailer.website},${retailer.verification},${retailer.catalogueConnected},${now})
    ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,website=EXCLUDED.website,verification=EXCLUDED.verification,catalogue_connected=EXCLUDED.catalogue_connected,updated_at=EXCLUDED.updated_at`;
}

export async function upsertNetworkLocation(location: NetworkLocation) {
  const sql = await fateDropPostgres();
  const now = Math.floor(Date.now() / 1000);
  await sql`INSERT INTO fatedrop_retailer_locations (id,retailer_id,provider,provider_id,name,address,postcode,latitude,longitude,website,phone,opening_details_json,verification,updated_at)
    VALUES (${location.id},${location.retailerId},${location.provider},${location.providerId},${location.name},${location.address},${location.postcode},${location.latitude},${location.longitude},${location.website},${location.phone},${JSON.stringify(location.openingDetails)}::jsonb,${location.verification},${now})
    ON CONFLICT (id) DO UPDATE SET retailer_id=EXCLUDED.retailer_id,provider=EXCLUDED.provider,provider_id=EXCLUDED.provider_id,name=EXCLUDED.name,address=EXCLUDED.address,postcode=EXCLUDED.postcode,latitude=EXCLUDED.latitude,longitude=EXCLUDED.longitude,website=EXCLUDED.website,phone=EXCLUDED.phone,opening_details_json=EXCLUDED.opening_details_json,verification=EXCLUDED.verification,updated_at=EXCLUDED.updated_at`;
}

export async function upsertProductIdentity(product: NetworkProductIdentity) {
  const sql = await fateDropPostgres();
  const now = Math.floor(Date.now() / 1000);
  await sql`INSERT INTO fatedrop_product_identities (id,tcg,canonical_key,title,product_type,set_name,edition,official_rrp_pence,rrp_source,rrp_verified_at,updated_at)
    VALUES (${product.id},${product.tcg},${product.canonicalKey},${product.title},${product.productType},${product.setName},${product.edition},${product.officialRrpPence},${product.rrpSource},${product.rrpVerifiedAt},${now})
    ON CONFLICT (id) DO UPDATE SET tcg=EXCLUDED.tcg,canonical_key=EXCLUDED.canonical_key,title=EXCLUDED.title,product_type=EXCLUDED.product_type,set_name=EXCLUDED.set_name,edition=EXCLUDED.edition,official_rrp_pence=COALESCE(EXCLUDED.official_rrp_pence,fatedrop_product_identities.official_rrp_pence),rrp_source=COALESCE(EXCLUDED.rrp_source,fatedrop_product_identities.rrp_source),rrp_verified_at=COALESCE(EXCLUDED.rrp_verified_at,fatedrop_product_identities.rrp_verified_at),updated_at=EXCLUDED.updated_at`;
}

export async function upsertNetworkProduct(product: NetworkProduct) {
  const sql = await fateDropPostgres();
  await sql`INSERT INTO fatedrop_products (id,retailer_id,product_identity_id,retailer_sku,title,url,image_url,created_at,updated_at)
    VALUES (${product.id},${product.retailerId},${product.productIdentityId},${product.retailerSku},${product.title},${product.url},${product.imageUrl},${product.createdAt},${product.updatedAt})
    ON CONFLICT (id) DO UPDATE SET retailer_id=EXCLUDED.retailer_id,product_identity_id=EXCLUDED.product_identity_id,retailer_sku=EXCLUDED.retailer_sku,title=EXCLUDED.title,url=EXCLUDED.url,image_url=EXCLUDED.image_url,updated_at=EXCLUDED.updated_at`;
}

export async function upsertNetworkOffer(offer: NetworkOffer) {
  const sql = await fateDropPostgres();
  await sql`INSERT INTO fatedrop_offers (id,product_id,retailer_id,location_id,product_identity_id,retailer_sku,title,url,channel,item_price_pence,mandatory_postage_pence,mandatory_fees_pence,delivery_known,stock_state,stock_quantity,observed_at)
    VALUES (${offer.id},${offer.productId},${offer.retailerId},${offer.locationId},${offer.productIdentityId},${offer.retailerSku},${offer.title},${offer.url},${offer.channel},${offer.itemPricePence},${offer.mandatoryPostagePence},${offer.mandatoryFeesPence},${offer.deliveryKnown},${offer.stockState},${offer.stockQuantity},${offer.observedAt})
    ON CONFLICT (id) DO UPDATE SET product_id=EXCLUDED.product_id,retailer_id=EXCLUDED.retailer_id,location_id=EXCLUDED.location_id,product_identity_id=EXCLUDED.product_identity_id,retailer_sku=EXCLUDED.retailer_sku,title=EXCLUDED.title,url=EXCLUDED.url,channel=EXCLUDED.channel,item_price_pence=EXCLUDED.item_price_pence,mandatory_postage_pence=EXCLUDED.mandatory_postage_pence,mandatory_fees_pence=EXCLUDED.mandatory_fees_pence,delivery_known=EXCLUDED.delivery_known,stock_state=EXCLUDED.stock_state,stock_quantity=EXCLUDED.stock_quantity,observed_at=EXCLUDED.observed_at`;
}

export async function saveInventoryObservation(inventory: NetworkInventoryObservation) {
  const sql = await fateDropPostgres();
  const rows = await sql`INSERT INTO fatedrop_inventory (id,offer_id,location_id,source_event_id,stock_state,quantity,observed_at)
    VALUES (${inventory.id},${inventory.offerId},${inventory.locationId},${inventory.sourceEventId},${inventory.stockState},${inventory.quantity},${inventory.observedAt})
    ON CONFLICT DO NOTHING RETURNING id`;
  return Boolean(rows[0]);
}

export async function saveSignalEvent(signal: NetworkSignalEvent) {
  const sql = await fateDropPostgres();
  const rows = await sql`INSERT INTO fatedrop_signal_events (id,kind,product_identity_id,offer_id,retailer_id,location_id,occurred_at,evidence_json)
    VALUES (${signal.id},${signal.kind},${signal.productIdentityId},${signal.offerId},${signal.retailerId},${signal.locationId},${signal.occurredAt},${JSON.stringify(signal.evidence)}::jsonb)
    ON CONFLICT (id) DO NOTHING RETURNING id`;
  return Boolean(rows[0]);
}
