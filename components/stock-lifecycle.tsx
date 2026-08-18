import { SignalIcon, type SignalIconName } from "./signal-icon";

const stages = [
  {
    name: "Whisper",
    description: "A new SKU or previously unseen product begins appearing in retailer data.",
    icon: "whisper" as SignalIconName,
  },
  {
    name: "Manifested",
    description: "The product has been verified as live and available to purchase.",
    icon: "manifested" as SignalIconName,
  },
  {
    name: "Vanished",
    description: "The product has transitioned from available to sold out.",
    icon: "vanished" as SignalIconName,
  },
  {
    name: "Echo",
    description: "Availability returns after selling out.",
    icon: "echo" as SignalIconName,
  },
] as const;

export function StockLifecycle() {
  return (
    <div className="lifecycle" aria-label="FateDrop stock lifecycle">
      <div className="lifecycle-signal" aria-hidden="true"><i /></div>
      <div className="lifecycle-grid">
        {stages.map((stage, index) => (
          <article className={`lifecycle-stage lifecycle-${stage.name.toLowerCase()}`} key={stage.name}>
            <span>0{index + 1}</span>
            <i aria-hidden="true" />
            <SignalIcon name={stage.icon} className="lifecycle-icon" />
            <h3>{stage.name}</h3>
            <p>{stage.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
