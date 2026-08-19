import { SignalIcon, type SignalIconName } from "./signal-icon";

const stages = [
  {
    name: "Echo",
    description: "Meaningful early movement is detected. An Echo is worth watching, but it is not confirmation that stock is coming.",
    icon: "echo" as SignalIconName,
  },
  {
    name: "Manifested",
    description: "Availability or another meaningful product event has been confirmed from observed evidence.",
    icon: "manifested" as SignalIconName,
  },
  {
    name: "Vanished",
    description: "Previously confirmed availability has been lost, sold out or removed from the observed source.",
    icon: "vanished" as SignalIconName,
  },
] as const;

export function StockLifecycle() {
  return (
    <div className="lifecycle" aria-label="FateDrop public signal lifecycle">
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
