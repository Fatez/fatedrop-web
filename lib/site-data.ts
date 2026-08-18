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
  snapshot: [
    { value: "6,332", label: "products tracked" },
    { value: "2,592", label: "currently in stock" },
    { value: "4", label: "catalogue retailers" },
    { value: "3", label: "healthy automated monitors" },
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
      features: ["Browse participating catalogues", "Basic product search", "Shops and events", "Limited wishlist", "Direct retailer purchasing"],
    },
    {
      name: "FateDrop Plus",
      price: "£4.99 / month",
      featured: true,
      features: ["Product-specific alerts", "Whisper, Manifested, Vanished and Echo notifications", "Universal Wishlist", "FateFind saved searches", "Maximum-price preferences", "True Price comparisons", "Local Radar alerts", "Release reminders"],
    },
    {
      name: "FateDrop Pro",
      price: "£14.99 / month",
      features: ["Earliest evidence-backed stock signals", "Priority delivery when production infrastructure supports it", "Advanced lifecycle intelligence", "Basket Breaker", "Collection Gap Finder", "Set Completion Basket", "FateFair", "Advanced event and vendor features", "Future multi-TCG access"],
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
      features: ["Complete catalogue", "Verified FateDrop storefront", "Search visibility", "Events and preorders", "Catalogue monitoring", "Basic referral analytics"],
    },
    {
      name: "Indie Pro",
      price: "£24.99 / month",
      secondaryPrice: "or £249 / year",
      features: ["Advanced analytics", "Demand Signal", "Event Vendor Mode", "Indie Exclusives", "Release Command Centre participation", "Priority catalogue support", "Clearly labelled promotional tools"],
    },
  ],
  audiences: [
    {
      eyebrow: "01 / Collectors",
      title: "Spend less time searching and more time collecting.",
      description:
        "Search multiple retailers, save wanted products, compare the real cost, receive relevant signals and discover local shops and events.",
      cta: "Explore collector tools",
      href: "/collectors",
      accent: "cyan",
    },
    {
      eyebrow: "02 / Retailers & vendors",
      title: "Put your products in front of collectors ready to buy.",
      description:
        "Connect a catalogue, gain search visibility, send buyers to your checkout and learn what collectors cannot find.",
      cta: "See retailer value",
      href: "/businesses",
      accent: "violet",
    },
    {
      eyebrow: "03 / Event organisers",
      title: "Make every event discoverable before the doors open.",
      description:
        "Publish tickets, schedules and vendors—then make stalls and temporary catalogues searchable on the show floor.",
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
        "Search products across participating independent retailer catalogues from one place.",
      meta: "One query / multiple indies",
    },
    {
      number: "02",
      title: "True Price",
      description:
        "Compare expected cost using price, known postage and free-delivery thresholds. Checkout remains the final confirmation.",
      meta: "Product + known delivery",
    },
    {
      number: "03",
      title: "Universal Wishlist",
      description:
        "Save wanted products across connected retailers, including unavailable or sold-out products.",
      meta: "One list / network-wide",
    },
    {
      number: "04",
      title: "FateFind",
      description:
        "Create a structured search using product, maximum price, condition, location, collection and preorder preferences.",
      meta: "A more precise wanted search",
    },
    {
      number: "05",
      title: "Drop Pulse",
      description:
        "See timestamp-supported labels such as just listed, recently restocked and price dropped.",
      meta: "Evidence-supported status",
    },
    {
      number: "06",
      title: "Local Radar",
      description:
        "Discover nearby independent shops, local inventory and events using location or a UK postcode.",
      meta: "Map + accessible list view",
    },
    {
      number: "07",
      title: "Events",
      description:
        "Browse upcoming card shows, trade nights, tournaments, ticket details and participating vendors.",
      meta: "Online discovery / real-world trade",
    },
    {
      number: "08",
      title: "Event Vendor Mode",
      description:
        "Search clearly labelled temporary inventory by product, vendor, stall, price and condition.",
      meta: "Event stock / never ordinary stock",
    },
  ],
  roadmap: [
    { name: "Basket Breaker", status: "In development" },
    { name: "FateBounty + Demand Signal", status: "In development" },
    { name: "FateFair", status: "Active expansion" },
    { name: "Collection Gap Finder", status: "Coming later" },
    { name: "Release Command Centre", status: "Coming later" },
    { name: "Preorder Confidence + Forecast", status: "Coming later" },
    { name: "Indie Exclusives + Fair Drop", status: "Coming later" },
    { name: "Event Companion + Shop Trails", status: "Active expansion" },
    { name: "Future multi-TCG support", status: "Coming later" },
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
