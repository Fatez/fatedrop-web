export const TCG_CODES = [
  "pokemon", "one-piece", "lorcana", "magic", "yugioh", "digimon",
  "flesh-and-blood", "star-wars-unlimited", "dragon-ball-super", "union-arena", "riftbound",
] as const;

export type TcgCode = typeof TCG_CODES[number];
export type TcgDefinition = { code:TcgCode; name:string; shortName:string; live:boolean; accent:string };
export type TcgLifecyclePreference = { mode:"recommended"|"custom"; whisper:boolean; echo:boolean; manifested:boolean; vanished:boolean };
export type TcgAlertPreferences = Partial<Record<TcgCode,TcgLifecyclePreference>>;

export const TCG_REGISTRY: readonly TcgDefinition[] = Object.freeze([
  { code:"pokemon", name:"Pokémon Trading Card Game", shortName:"Pokémon", live:true, accent:"#d2b66f" },
  { code:"one-piece", name:"ONE PIECE CARD GAME", shortName:"One Piece", live:false, accent:"#ef6b68" },
  { code:"lorcana", name:"Disney Lorcana Trading Card Game", shortName:"Lorcana", live:false, accent:"#9f83e8" },
  { code:"magic", name:"Magic: The Gathering", shortName:"Magic", live:false, accent:"#e18a55" },
  { code:"yugioh", name:"Yu-Gi-Oh! Trading Card Game", shortName:"Yu-Gi-Oh!", live:false, accent:"#6fb0df" },
  { code:"digimon", name:"Digimon Card Game", shortName:"Digimon", live:false, accent:"#7ccbd0" },
  { code:"flesh-and-blood", name:"Flesh and Blood", shortName:"Flesh and Blood", live:false, accent:"#c56f63" },
  { code:"star-wars-unlimited", name:"Star Wars: Unlimited", shortName:"Star Wars", live:false, accent:"#76a4d9" },
  { code:"dragon-ball-super", name:"Dragon Ball Super Card Game", shortName:"Dragon Ball", live:false, accent:"#edaf54" },
  { code:"union-arena", name:"Union Arena", shortName:"Union Arena", live:false, accent:"#7bc78d" },
  { code:"riftbound", name:"Riftbound: League of Legends Trading Card Game", shortName:"Riftbound", live:false, accent:"#73b8ae" },
]);

const codes = new Set<string>(TCG_CODES);
export function isTcgCode(value:unknown):value is TcgCode { return typeof value === "string" && codes.has(value); }
export function normalizeSelectedTcgCodes(value:unknown, fallback:readonly TcgCode[]=["pokemon"]):TcgCode[] {
  if (!Array.isArray(value)) return [...fallback];
  const selected = [...new Set(value.filter(isTcgCode))];
  return selected.length ? selected : [...fallback];
}

export function normalizeTcgAlertPreferences(value:unknown,selected:readonly TcgCode[]):TcgAlertPreferences {
  const input=value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{};
  return Object.fromEntries(selected.map((code)=>{
    const raw=input[code]&&typeof input[code]==="object"&&!Array.isArray(input[code])?input[code] as Record<string,unknown>:{};
    const mode=raw.mode==="custom"?"custom":"recommended";
    const enabled=(key:string)=>mode==="recommended"?true:raw[key]!==false;
    return [code,{mode,whisper:enabled("whisper"),echo:enabled("echo"),manifested:enabled("manifested"),vanished:enabled("vanished")}];
  })) as TcgAlertPreferences;
}
