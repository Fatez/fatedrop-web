export const siteConfig = {
  name: "FateDrop",
  title: "FateDrop — UK TCG Signal Intelligence & Indie Discovery",
  description:
    "Follow evidence-backed stock signals, understand True Price, create FateFind hunts, receive FateMatch results and discover independent TCG retailers and events across the UK.",
  tagline: "Follow the signal. Find the retailer. Collect smarter.",
  nav: [
    { label: "Collectors", href: "/collectors" },
    { label: "Retailers", href: "/businesses" },
    { label: "Events", href: "/events" },
    { label: "Trust", href: "/trust" },
    { label: "About", href: "/about" },
    { label: "Merch", href: "/merch" },
  ],
  marketCategories: ["Major retail products", "Independent catalogues", "Singles", "Sealed products", "Graded cards", "Accessories", "Preorders", "Local stock", "Event-vendor inventory"],
  networkTargets: [
    { value: "100+", label: "participating catalogues" },
    { value: "≈90,000+", label: "searchable offers" },
    { value: "Hundreds", label: "independent businesses" },
    { value: "National", label: "event + vendor coverage" },
    { value: "Multiple", label: "TCGs after Pokémon" },
  ],
  collectorPlans: [
    {
      name: "Free",
      price: "£0",
      features: ["FateDrop ID", "Network discovery", "Participating shops and events", "Basic saved products", "Direct retailer purchasing"],
    },
    {
      name: "FateDrop Plus",
      price: "£4.99 / month",
      featured: true,
      features: ["Premium signal detail", "Whisper, Echo, Manifested and Vanished lifecycle alerts", "FateFind saved hunts with FateMatch results", "True Price context", "Local Radar tools where configured", "Premium Discord entitlement when enabled"],
    },
    {
      name: "FateDrop Pro",
      price: "£14.99 / month",
      features: ["Shared Premium capability foundation", "Higher-tier feature split under product review", "Future advanced intelligence only as released", "No guaranteed-first or fabricated priority claims"],
    },
  ],
  retailerPlans: [
    {
      name: "Free Retailer",
      price: "£0",
      features: ["Basic verified profile", "Limited catalogue", "Direct retailer links", "Organic discovery"],
    },
    {
      name: "Indie",
      price: "£9.99 / month",
      secondaryPrice: "or £99 / year",
      featured: true,
      features: ["Complete catalogue", "Verified FateDrop storefront", "Search visibility", "Events and preorders", "Catalogue monitoring", "Basic referral analytics when available"],
    },
    {
      name: "Indie Pro",
      price: "£24.99 / month",
      secondaryPrice: "or £249 / year",
      features: ["Advanced analytics when released", "Aggregated demand insight when released", "Event Vendor Mode when released", "Priority catalogue support", "Clearly labelled promotional tools"],
    },
  ],
  audiences: [
    {
      eyebrow: "01 / Collectors",
      title: "Find the right drop with better context.",
      description:
        "Follow signals, compare True Price, create FateFind hunts, receive FateMatch results and discover independent retailers and events through one network.",
      cta: "Explore collector tools",
      href: "/collectors",
      accent: "cyan",
    },
    {
      eyebrow: "02 / Retailers & vendors",
      title: "Be found by collectors already looking.",
      description:
        "Connect a catalogue, keep your checkout and become visible inside relevant collector journeys without becoming a marketplace listing.",
      cta: "See retailer value",
      href: "/businesses",
      accent: "violet",
    },
    {
      eyebrow: "03 / Event organisers",
      title: "Make the real-world TCG scene easier to discover.",
      description:
        "Bring source-backed dates, venues and participating vendors into the same wider FateDrop network.",
      cta: "Explore event discovery",
      href: "/events",
      accent: "green",
    },
  ],
  features: [
    {
      number: "01",
      title: "Signal Intelligence",
      description:
        "Whisper catches product or catalogue movement. Echo says access, queue, traffic or security conditions changed. Manifested confirms purchasable stock is live. Vanished closes the loop when previously confirmed availability is gone.",
      meta: "Four states / one meaning",
    },
    {
      number: "02",
      title: "True Price",
      description:
        "Compare an observed offer with official RRP and known mandatory delivery, including the £ and percentage difference above or below RRP where the evidence supports it.",
      meta: "Price + RRP + known delivery",
    },
    {
      number: "03",
      title: "FateFind → FateMatch",
      description:
        "Create a FateFind hunt with the product and limits that matter. When an observed active offer qualifies, that successful result is a FateMatch.",
      meta: "Wanted intent / qualifying result",
    },
    {
      number: "04",
      title: "Independent Discovery",
      description:
        "Find products through participating independents and continue to the retailer's own product page and checkout. FateDrop helps with discovery and context; the retailer remains the seller.",
      meta: "Discover here / buy direct",
    },
    {
      number: "05",
      title: "Universal Wishlist",
      description:
        "Keep products you care about in one account-level list without turning every saved item into a live hunt.",
      meta: "Saved products / account-wide",
    },
    {
      number: "06",
      title: "Local Radar",
      description:
        "Discover nearby TCG businesses while keeping external Places results separate from verified FateDrop-network stock.",
      meta: "Nearby discovery / evidence separated",
    },
    {
      number: "07",
      title: "Fate Encounters",
      description:
        "Browse source-backed UK card shows, venues and participating vendors and verify organiser details before travel.",
      meta: "Real-world network",
    },
    {
      number: "08",
      title: "Drop Pulse",
      description:
        "Summarise timestamp-supported network movement without turning weak evidence into manufactured urgency.",
      meta: "Evidence-supported context",
    },
  ],
  roadmap: [
    { name: "Basket Breaker", status: "Planned" },
    { name: "FateBounty + Demand Signal", status: "Planned" },
    { name: "FateFair", status: "Planned" },
    { name: "Collection Gap Finder", status: "Planned" },
    { name: "Release Command Centre", status: "Planned" },
    { name: "Preorder Confidence + Forecast", status: "Planned" },
    { name: "Indie Exclusives + Fair Drop", status: "Planned" },
    { name: "Event Companion + Shop Trails", status: "Planned" },
    { name: "Future multi-TCG support", status: "Planned" },
  ],
} as const;

export const demoEvents = [
  {
    name: "South East Card Collective",
    date: "Saturday 12 September",
    hours: "10:00–16:00",
    venue: "Riverside Hall, Maidstone",
    postcode: "Demo location · ME14",
    organiser: "Demo organiser · South East Collectors",
    ticket: "Demo ticket · £4 advance",
    description: "A demonstration listing showing how a card show, its vendors and visitor details could appear.",
    directions: "Directions would open from the confirmed venue.",
    vendors: "18 demo vendors",
    stock: "Event inventory available",
  },
  {
    name: "Northern Trade & Play",
    date: "Sunday 27 September",
    hours: "09:30–15:30",
    venue: "Foundry Rooms, Manchester",
    postcode: "Demo location · M1",
    organiser: "Demo organiser · Northern Trade Club",
    ticket: "Demo ticket · £6 entry",
    description: "A demonstration trade-and-play listing with participating vendors and event-day discovery.",
    directions: "Directions would open from the confirmed venue.",
    vendors: "24 demo vendors",
    stock: "Vendor list published",
  },
] as const;