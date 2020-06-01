export interface ModelingPrepFinancialsResponse {
  financialStatementList: ModelingPrepIncomeStatements[];
}

export interface ModelingPrepHistoricPriceResponse {
  historicalStockList: ModelingPrepHistoricPrices[];
}

export interface ModelingPrepHistoricPrices {
  symbol: string;
  historical: ModelingPrepHistoricPrice[];
}

export interface ModelingPrepIncomeStatements {
  'symbol': string;
  'financials': ModelingPrepIncomeStatement[];
}

export interface ModelingPrepHistoricPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
  unadjustedVolume: number;
  change: number;
  changePercent: number;
  vwap: number;
  label: string;
  changeOverTime: number;
}

export type ModelingPrepIncomeStatementKey = keyof ModelingPrepIncomeStatement;
export interface ModelingPrepIncomeStatement {
  'date': string;
  'Revenue': string;
  'Revenue Growth': string;
  'Cost of Revenue': string;
  'Gross Profit': string;
  'R&D Expenses': string;
  'SG&A Expense': string;
  'Operating Expenses': string;
  'Operating Income': string;
  'Interest Expense': string;
  'Earnings before Tax': string;
  'Income Tax Expense': string;
  'Net Income - Non-Controlling int': string;
  'Net Income - Discontinued ops': string;
  'Net Income': string;
  'Preferred Dividends': string;
  'Net Income Com': string;
  'EPS': string;
  'EPS Diluted': string;
  'Weighted Average Shs Out': string;
  'Weighted Average Shs Out (Dil)': string;
  'Dividend per Share': string;
  'Gross Margin': string;
  'EBITDA Margin': string;
  'EBIT Margin': string;
  'Profit Margin': string;
  'Free Cash Flow margin': string;
  'EBITDA': string;
  'EBIT': string;
  'Consolidated Income': string;
  'Earnings Before Tax Margin': string;
  'Net Profit Margin': string;
}

export interface ModelingPrepProfile {
  symbol: string;
  price: number;
  beta: number;
  volAvg: number;
  mktCap: number;
  lastDiv: number;
  range: string;
  changes: number;
  companyName: string;
  exchange: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  dcfDiff: number;
  dcf: number;
  image: string;
}

export interface ModelingPrepQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number | null;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  exchange: string;
  open: number;
  previousClose: number;
  eps: number | null;
  pe: number | null;
  earningsAnnouncement: string | null;
  sharesOutstanding: number | null;
  timestamp: number;
}
