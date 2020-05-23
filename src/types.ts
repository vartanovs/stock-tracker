export type ExchangeType = 'etf' | 'index' | 'nasdaq' | 'nyse';

export interface Stock {
  exchangeType: ExchangeType;
  symbol: string;
}
