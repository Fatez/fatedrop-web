const stages = [
  {
    name: "Whisper",
    description: "A new SKU or previously unseen product begins appearing in retailer data.",
  },
  {
    name: "Manifested",
    description: "The product has been verified as live and available to purchase.",
  },
  {
    name: "Vanished",
    description: "The product has transitioned from available to sold out.",
  },
  {
    name: "Echo",
    description: "Availability returns after selling out.",
  },
] as const;

export function StockLifecycle() {
  return (
    <div className="lifecycle" aria-label="FateDrop stock lifecycle">
      <div className="lifecycle-signal" aria-hidden="true"><i /></div>
      <div className="lifecycle-grid">
        {stages.map((stage, index) => (
          <article className="lifecycle-stage" key={stage.name}>
            <span>0{index + 1}</span>
            <i aria-hidden="true" />
            <h3>{stage.name}</h3>
            <p>{stage.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
