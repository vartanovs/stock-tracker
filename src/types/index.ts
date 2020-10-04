export type ExchangeType = 'etf' | 'index' | 'nasdaq' | 'nyse';

export interface Stock {
  exchangeType: ExchangeType;
  symbol: string;
  name: string;
}

export type StockPayloadKey = keyof StockPayload;
export interface StockPayload {
  exchange_type: ExchangeType;
  symbol: string;
  name: string;
}

export interface StockPrice extends Stock {
  date: Date | string;
  high: number;
  low: number;
}

export interface CurrentStockProfile extends Stock {
  industry: string;
  sector: string;
  price: number;
  shares: number;
  mktCap: number;
  lastDiv: number;
}

export interface CurrentStockProfilePayload extends StockPayload {
  industry: string;
  sector: string;
  price: number;
  shares: number;
  mkt_cap: number;
  last_div: number;
}

export interface HistoricStockPrices {
  symbol: string;
  lastQtPrice: number;
  twoQtPrice: number;
  threeQtPrice: number;
  lastYrPrice: number;
  fiveQtPrice: number;
  sixQtPrice: number;
  twoYrPrice: number;
  fiveYrPrice: number;
}

export type HistoricStockPricesPayloadKey = keyof HistoricStockPricesPayload;
export interface HistoricStockPricesPayload {
  symbol: string;
  last_qt_price: number;
  two_qt_price: number;
  three_qt_price: number;
  last_yr_price: number;
  five_qt_price: number;
  six_qt_price: number;
  two_yr_price: number;
  five_yr_price: number;
  [key: string]: number | string | undefined;
}

export interface StockProfile extends CurrentStockProfile, HistoricStockPrices {}

export type StockProfilePayloadKey = keyof StockProfilePayload;
export interface StockProfilePayload extends CurrentStockProfilePayload, HistoricStockPricesPayload {}

export type StockPricePayloadKey = keyof StockPricePayload;
export interface StockPricePayload {
  exchange_type: string,
  symbol: string;
  date: Date | string;
  high: number;
  low: number;
}

export type ExtendedIncomeStatementPayloadKey = keyof ExtendedIncomeStatementPayload;
export interface ExtendedIncomeStatementPayload {
  symbol: string;
  date: string;
  revenue: string;
  revenue_growth: string;
  cost_of_revenue: string;
  gross_profit: string;
  rd_expense: string;
  sga_expense: string;
  operating_expense: string;
  operating_income: string;
  interest_expense: string;
  ebt: string;
  income_tax_expense: string;
  net_income_non_controlling: string;
  net_income_discontinued: string;
  net_income: string;
  preferred_dividends: string;
  net_income_com: string;
  eps: string;
  eps_diluted: string;
  shares_outstanding: string;
  shares_outstanding_diluted: string;
  dividend_per_share: string;
  gross_margin: string;
  ebitda_margin: string;
  ebit_margin: string;
  profit_margin: string;
  free_cash_flow_margin: string;
  ebitda: string;
  ebit: string;
  consolidated_income: string;
  ebt_margin: string;
  net_profit_margin: string;
}

export interface ExtendedIncomeStatement {
  symbol: string;
  date: Date;
  revenue: number;
  revenueGrowth: number;
  costOfRevenue: number;
  grossProfit: number;
  rdExpense: number;
  sgaExpense: number;
  operatingExpense: number;
  operatingIncome: number;
  interestExpense: number;
  ebt: number;
  incomeTaxExpense: number;
  netIncomeNonControlling: number;
  netIncomeDiscontinued: number;
  netIncome: number;
  preferredDividends: number;
  netIncomeCom: number;
  eps: number;
  epsDiluted: number;
  sharesOutstanding: number;
  sharesOutstandingDiluted: number;
  dividendPerShare: number;
  grossMargin: number;
  ebitdaMargin: number;
  ebitMargin: number;
  profitMargin: number;
  freeCashFlowMargin: number;
  ebitda: number;
  ebit: number;
  consolidatedIncome: number;
  ebtMargin: number;
  netProfitMargin: number;
}

export type IncomeStatement =
  Pick<ExtendedIncomeStatement, 'symbol' | 'date' | 'revenue' | 'grossProfit' | 'operatingIncome' | 'netIncomeCom'>;

export type IncomeStatementPayloadKey = keyof IncomeStatementPayload;
export type IncomeStatementPayload =
  Pick<ExtendedIncomeStatementPayload, 'symbol' | 'date' | 'revenue' | 'gross_profit' | 'operating_income' | 'net_income_com'>;

export type RecentFinancialsPayloadKey = keyof RecentFinancialsPayload;
export interface RecentFinancialsPayload extends StockPayload, Record<string, number | string | undefined> {
  as_of?: string;
  revenue_8?: number;
  revenue_7?: number;
  revenue_6?: number;
  revenue_5?: number;
  revenue_4?: number;
  revenue_3?: number;
  revenue_2?: number;
  revenue_1?: number;
  gross_profit_8?: number;
  gross_profit_7?: number;
  gross_profit_6?: number;
  gross_profit_5?: number;
  gross_profit_4?: number;
  gross_profit_3?: number;
  gross_profit_2?: number;
  gross_profit_1?: number;
  op_income_8?: number;
  op_income_7?: number;
  op_income_6?: number;
  op_income_5?: number;
  op_income_4?: number;
  op_income_3?: number;
  op_income_2?: number;
  op_income_1?: number;
  net_income_8?: number;
  net_income_7?: number;
  net_income_6?: number;
  net_income_5?: number;
  net_income_4?: number;
  net_income_3?: number;
  net_income_2?: number;
  net_income_1?: number;
}
