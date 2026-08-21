export const siteConfig = {
  name: "FateDrop",
  title: "FateDrop — UK TCG Discovery Network",
  description:
    "Search participating TCG catalogues, independent retailers and clearly labelled event discovery across the UK.",
  tagline: "Find the drop. Support independents. Collect smarter.",
  nav: [
    { label: "Collectors", href: "/collectors" },
    { label: "Retailers", href: "/businesses" },
    { label: "Events", href: "/events" },
    { label: "Free Drops", href: "/free-drops" },
    { label: "Trust", href: "/trust" },
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
      features: ["Premium signal detail", "Echo, Manifested and Vanished lifecycle alerts", "FateFind saved intent", "True Price context", "Local Radar tools where configured", "Premium Discord entitlement when enabled"],
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
      title: "Spend less time searching and more time collecting.",
      description:
        "Search participating retailers, save wanted intent, compare the real cost, receive relevant signals and discover local shops and events.",
      cta: "Explore collector tools",
      href: "/collectors",
      accent: "cyan",
    },
    {
      eyebrow: "02 / Retailers & vendors",
      title: "Put your products in front of collectors already looking.",
      description:
        "Connect a catalogue, gain relevant discovery, send buyers to your checkout and build toward evidence-backed demand insight.",
      cta: "See retailer value",
      href: "/businesses",
      accent: "violet",
    },
    {
      eyebrow: "03 / Event organisers",
      title: "Make every event discoverable before the doors open.",
      description:
        "Build toward one journey for dates, tickets, vendors and clearly labelled temporary event inventory.",
      cta: "Explore event discovery",
      href: "/events",
      accent: "green",
    },
  ],
  features: [
    {
      number: "01",
      title: "Unified Search",
      description:
        "Search products across connected catalogue offers through one network model as feeds come online.",
      meta: "One query / connected sources",
    },
    {
      number: "02",
      title: "True Price",
      description:
        "Compare item price, verified RRP and known mandatory delivery. Unknown delivery remains unknown.",
      meta: "Item + RRP + known delivery",
    },
    {
      number: "03",
      title: "Watchlist",
      description:
        "Keep wanted products in one account-level collector list as the shared save model develops.",
      meta: "Saved products / account-wide",
    },
    {
      number: "04",
      title: "FateFind",
      description:
        "Create a structured wanted search using product, maximum True Price or RRP premium and online/local scope.",
      meta: "Saved intent / network monitoring",
    },
    {
      number: "05",
      title: "Drop Pulse",
      description:
        "Summarise timestamp-supported network movement without turning weak evidence into manufactured urgency.",
      meta: "Evidence-supported context",
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
      title: "Events",
      description:
        "Browse clearly labelled demonstration or sourced event information and verify organiser details before travel.",
      meta: "Demo / sourced beta",
    },
    {
      number: "08",
      title: "Event Vendor Mode",
      description:
        "Planned temporary inventory search that stays clearly separate from ordinary shop stock.",
      meta: "Planned event-stock layer",
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
