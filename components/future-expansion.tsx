const futureGames = [
  "Magic: The Gathering",
  "One Piece",
  "Yu-Gi-Oh!",
  "Disney Lorcana",
  "Dragon Ball",
  "Digimon",
  "Star Wars Unlimited",
  "Flesh and Blood",
  "Riftbound",
];

const expansionJourney = [
  {
    title: "Prove Pokémon",
    body: "Build catalogue density, trusted monitoring, collector tools and a strong independent-retailer network.",
  },
  {
    title: "Expand the catalogue",
    body: "Introduce additional games based on demonstrated collector demand and retailer overlap.",
  },
  {
    title: "Connect the TCG market",
    body: "Bring products, stock intelligence, retailers, collectors, vendors and events together across one network.",
  },
];

export function FutureExpansion() {
  return (
    <section className="future-expansion section-shell" id="future">
      <div className="future-expansion-head">
        <p className="eyebrow"><span />The future of FateDrop</p>
        <h2>What does the future look like?</h2>
        <h3>Pokémon is where FateDrop begins—not where it ends.</h3>
        <div className="future-expansion-copy">
          <p>Our first mission is to build the strongest possible discovery, comparison and stock-intelligence network for Pokémon collectors and independent UK retailers.</p>
          <p>Once that foundation is proven, reliable and commercially sustainable, the same FateDrop network can expand across the wider trading-card world.</p>
          <p>Collectors will be able to follow the games they love, search participating retailer catalogues, compare available offers, receive relevant stock intelligence and discover events through one connected account.</p>
          <p>Retailers will be able to connect one catalogue and reach collectors across every TCG audience they serve.</p>
          <strong>One platform. More games. A stronger collecting network.</strong>
        </div>
      </div>

      <div className="future-network" aria-label="Pokémon-first FateDrop network branching into clearly labelled future TCG expansion paths">
        <div className="future-network-aura" aria-hidden="true"><i /><i /><i /></div>
        <div className="future-paths" aria-hidden="true">
          {futureGames.map((game, index) => <i className={`future-path path-${index + 1}`} key={game} />)}
        </div>
        <div className="pokemon-foundation">
          <span>Current foundation</span>
          <strong>Pokémon</strong>
          <small>First market</small>
        </div>
        <div className="future-node-grid">
          {futureGames.map((game, index) => (
            <article className={`future-node node-${index + 1}`} key={game}>
              <div className="abstract-card" aria-hidden="true"><i /><i /></div>
              <div><strong>{game}</strong><span>Future expansion</span></div>
            </article>
          ))}
        </div>
      </div>

      <div className="future-journey" aria-label="FateDrop expansion journey">
        {expansionJourney.map((step, index) => (
          <article key={step.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>

      <div className="future-propositions">
        <article><span>For retailers</span><strong>One catalogue connection. Every TCG audience you serve.</strong></article>
        <article><span>For collectors</span><strong>One account for every game you collect.</strong></article>
      </div>

      <p className="future-closing">We are building FateDrop carefully—one reliable market at a time.</p>
    </section>
  );
}
