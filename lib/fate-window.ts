import type { TruePriceOffer } from "@/lib/true-price";

export type FateWindowState = "buy" | "no-rush" | "watch" | "wait" | "evidence";

export type FateWindowDecision = {
  state: FateWindowState;
  label: string;
  headline: string;
  reason: string;
};

export function evaluateFateWindow(offer: TruePriceOffer, matchingAvailableOffers: number): FateWindowDecision {
  if (!offer.available) {
    return {
      state: "watch",
      label: "WATCH",
      headline: "No buying window right now.",
      reason: "This offer is not currently reported available. FateDrop should keep watching for the next verified return.",
    };
  }

  if (offer.rrpPence === null) {
    return {
      state: "evidence",
      label: "EVIDENCE BUILDING",
      headline: "FateDrop is not guessing the buying window.",
      reason: "Official RRP is not verified for this product identity yet. Price advice stays withheld until the reference layer is trustworthy.",
    };
  }

  if (offer.deliveredPence === null || offer.deliveredPremiumPercent === null) {
    return {
      state: "evidence",
      label: "DELIVERY CHECK",
      headline: "The sticker price is not enough evidence.",
      reason: "Mandatory delivery is not verified, so FateDrop cannot safely judge the real buying price yet.",
    };
  }

  const premium = offer.deliveredPremiumPercent;

  if (premium <= 2 && matchingAvailableOffers <= 2) {
    return {
      state: "buy",
      label: "BUY WINDOW OPEN",
      headline: "Strong buying condition.",
      reason: `Delivered price is at or very near verified RRP and only ${matchingAvailableOffers} matching live offer${matchingAvailableOffers === 1 ? " is" : "s are"} currently resolved in the connected network.`,
    };
  }

  if (premium <= 5) {
    return {
      state: "no-rush",
      label: "GOOD PRICE · NO RUSH",
      headline: "The price is healthy.",
      reason: matchingAvailableOffers > 2
        ? `Delivered price is close to RRP and ${matchingAvailableOffers} matching live offers are currently resolved, so there is no evidence-led reason to panic-buy.`
        : "Delivered price is close to verified RRP. The offer looks healthy, but FateDrop does not currently see enough pressure to manufacture urgency.",
    };
  }

  if (premium >= 20) {
    return {
      state: "wait",
      label: "WAIT",
      headline: "The current premium is difficult to justify.",
      reason: `Best-known delivered premium is ${premium.toFixed(1)}% above verified RRP. FateDrop should keep watching for a better buying window instead of creating urgency around an expensive offer.`,
    };
  }

  return {
    state: "watch",
    label: "WATCH",
    headline: "There may be a better window.",
    reason: `Delivered price is ${premium.toFixed(1)}% above verified RRP. Keep monitoring price and network availability before committing.`,
  };
}
