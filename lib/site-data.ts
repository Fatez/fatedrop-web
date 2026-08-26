export const siteConfig = {
  name: "FateDrop",
  title: "FateDrop — UK TCG Intelligence & Fate Network",
  description:
    "Follow evidence-backed stock signals, use FateFind to compare live value against verified RRP/reference, create FateMatch watches, discover retailers through the Fate Network and access collector trading through Fate Trader as beta access expands.",
  tagline: "Follow the signal. Find the right path. Collect smarter.",
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
      features: ["Full FateFind value intelligence", "FateMatch personal monitoring and buying conditions", "Whisper, Echo, Manifested and Vanished lifecycle alerts", "Instant eligible app + Discord notifications", "Advanced alert filters", "True Price context inside FateFind when delivery is known", "Local Radar tools where configured"],
    },
  ],
  retailerPlans: [
    {
      name: "Free Retailer",
      price: "£0",
      features: ["Basic verified profile", "Organic evidence-based discovery", "Direct retailer links", "No paid ranking or trust advantage"],
    },
    {
      name: "FateDrop Indie",
      price: "£9.99 / month",
      secondaryPrice: "or £99 / year",
      featured: true,
      features: ["Complete connected catalogue", "Verified FateDrop storefront", "Search and FateFind eligibility from genuine offer evidence", "Events and preorders", "Catalogue monitoring", "Basic referral analytics when available", "Retailer keeps customer, checkout and fulfilment"],
    },
  ],
  audiences: [
    {
      eyebrow: "01 / Collectors",
      title: "Find, compare, watch and trade through one network.",
      description:
        "Follow signals, use FateFind to compare real value, let FateMatch watch your buying conditions, discover retailers through the Fate Network and use Fate Trader for collector-to-collector trading as beta access expands.",
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
      title: "FateFind",
      description:
        "Compare genuinely equivalent live offers using the correct RRP/reference and identify the strongest-value option rather than confusing value with the smallest raw checkout number. Known delivery is kept separate and True Price is shown as supporting checkout context.",
      meta: "Best value now / verified RRP context",
    },
    {
      number: "03",
      title: "FateMatch",
      description:
        "Choose a specific product and the conditions you would actually buy at — stock, item-price, True Price, RRP percentage or retailer rules — and let FateDrop alert you when a qualifying live offer appears.",
      meta: "Watch my conditions / alert when qualified",
    },
    {
      number: "04",
      title: "Fate Network",
      description:
        "Search one connected view of major, specialist and independent retailer supply, then continue directly to the retailer's own product page and checkout. FateDrop provides discovery and intelligence; the retailer remains the seller.",
      meta: "Connected supply / buy direct",
    },
    {
      number: "05",
      title: "Fate Trader",
      description:
        "Collector-to-collector trading uses the same verified card identity foundation. Record what you have and what you want, then let Fate Trade Finder look for compatible trade intent as beta access expands.",
      meta: "Collector trading / beta rollout",
    },
    {
      number: "06",
      title: "Universal Wishlist",
      description:
        "Keep products you care about in one account-level list without turning every saved item into a live watch.",
      meta: "Saved products / account-wide",
    },
    {
      number: "07",
      title: "Local Radar",
      description:
        "Discover nearby TCG businesses while keeping external Places results separate from verified FateDrop-network stock.",
      meta: "Nearby discovery / evidence separated",
    },
    {
      number: "08",
      title: "Fate Encounters",
      description:
        "Browse source-backed UK card shows, venues and participating vendors and verify organiser details before travel.",
      meta: "Real-world network",
    },
    {
      number: "09",
      title: "Drop Pulse",
      description:
        "Summarise timestamp-supported network movement without turning weak evidence into manufactured urgency.",
      meta: "Evidence-supported context",
    },
  ],
  roadmap: [
    { name: "Fate Trader matching expansion", status: "Beta roadmap" },
    { name: "Collection intelligence", status: "Planned" },
    { name: "Preorder confidence", status: "Planned" },
    { name: "Retailer demand intelligence", status: "Planned" },
    { name: "Multi-TCG expansion", status: "Planned" },
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
