export interface Snapshot {
  latestTrade: SnapshotTrade;
  latestQuote: SnapshotQuote;
  minuteBar: SnapshotBar;
  dailyBar: SnapshotBar;
  prevDailyBar: SnapshotBar;
}

export interface SnapshotBar {
  t: string; // timestamp RFC-3339 format
  o: number; // open price
  h: number; // high price
  l: number; // low price
  c: number; // close price
  v: number; // volume
  n: number; // unknown
  vw: number; // unknown
}

export interface SnapshotQuote {
  t: string; // timestamp RFC-3339 format with nanosecond precision
  ax: string; // ask exchange
  ap: number; // ask price
  as: number; // ask shares
  bx: string; // bid exchange
  bp: number; // bid price
  bs: number; // bid shares
  c: string[]; // quote conditions
}

export interface SnapshotTrade {
  t: string; // timestamp RFC-3339 format with nanosecond precision
  x: string; // exchange where the trade occurred
  p: number; // trade price
  s: number; // trade shares
  c: string[]; // trade conditions
  i: number; // trade id
  z: string; // tape
}
