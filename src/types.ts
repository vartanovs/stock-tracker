export type ExchangeType = 'etf' | 'index' | 'nasdaq' | 'nyse';

export interface Stock {
  exchangeType: ExchangeType;
  symbol: string;
}

export interface StockPayload {
  exchange_type: ExchangeType;
  symbol: string;
}

export interface ModelingPrepHistoricPriceResponse {
  historicalStockList: ModelingPrepHistoricPrices[];
}

export interface ModelingPrepHistoricPrices {
  symbol: string;
  historical: ModelingPrepHistoricPrice[];
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

export type StockPricePayloadKey = keyof StockPricePayload;
export interface StockPricePayload extends StockPayload {
  date: string;
  high: number;
  low: number;
}

export interface ModelingPrepFinancialsResponse {
  financialStatementList: ModelingPrepIncomeStatements[];
}

// Modeling Prep Income Statement
export type ModelingPrepIncomeStatementKey = keyof ModelingPrepIncomeStatement;
export type IncomeStatementKey = keyof FullIncomeStatementPayload;

export interface FullIncomeStatementPayload {
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

export interface FullIncomeStatement {
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

export type IncomeStatementPayload =
  Pick<FullIncomeStatementPayload, 'symbol' | 'date' | 'revenue' | 'gross_profit' | 'operating_income' | 'net_income_com'>;

export type IncomeStatement =
  Pick<FullIncomeStatement, 'symbol' | 'date' | 'revenue' | 'grossProfit' | 'operatingIncome' | 'netIncomeCom'>;

export interface ModelingPrepIncomeStatements {
  'symbol': string;
  'financials': ModelingPrepIncomeStatement[];
}

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

export interface RecentFinancialsPayload extends StockPayload {
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
  [key: string]: number | string | undefined;
}
