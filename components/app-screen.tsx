/* eslint-disable @next/next/no-img-element */

const screens = {
  home: "/assets/app-home.jpeg",
  search: "/assets/app-search.jpeg",
  indie: "/assets/app-indie.jpeg",
  settings: "/assets/app-settings.jpeg",
} as const;

export function AppScreen({ compact = false, screen = "home" }: { compact?: boolean; screen?: keyof typeof screens }) {
  return (
    <div className={compact ? "app-screen real-screen compact" : "app-screen real-screen"}>
      <img src={screens[screen]} alt={`FateDrop mobile app ${screen} screen`} width="708" height="1536" loading={compact ? "lazy" : "eager"} />
    </div>
  );
}
