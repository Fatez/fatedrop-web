import { SignalIcon, type SignalIconName } from "./signal-icon";

const stages = [
  {
    name: "Whisper",
    description: "Catalogue or product movement has been detected. Something may be coming, but stock is not confirmed.",
    icon: "whisper" as SignalIconName,
  },
  {
    name: "Echo",
    description: "Queue, traffic, security or access conditions have changed. Get ready; stock is still not confirmed.",
    icon: "echo" as SignalIconName,
  },
  {
    name: "Manifested",
    description: "Purchasable availability has been confirmed from observed evidence. Stock is live.",
    icon: "manifested" as SignalIconName,
  },
  {
    name: "Vanished",
    description: "Previously confirmed availability has gone, sold out or is no longer verified.",
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
