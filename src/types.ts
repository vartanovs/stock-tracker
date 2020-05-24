export type ExchangeType = 'etf' | 'index' | 'nasdaq' | 'nyse';

export interface Stock {
  exchangeType: ExchangeType;
  symbol: string;
}

export interface StockPayload {
  exchange_type: ExchangeType;
  symbol: string;
}

export interface ModelingPrepFinancialsResponse {
  financialStatementList: ModelingPrepIncomeStatements[];
}

// Modeling Prep Income Statement
export type ModelingPrepIncomeStatementKey = keyof ModelingPrepIncomeStatement;
export type IncomeStatementKey = keyof IncomeStatement;

export interface IncomeStatement {
  symbol: string;
  date: string;
  revenue: number;
  revenue_growth: number;
  cost_of_revenue: number;
  gross_profit: number;
  rd_expense: number;
  sga_expense: number;
  operating_expense: number;
  operating_income: number;
  interest_expense: number;
  ebt: number;
  income_tax_expense: number;
  net_income_non_controlling: number;
  net_income_discontinued: number;
  net_income: number;
  preferred_dividends: number;
  net_income_com: number;
  eps: number;
  eps_diluted: number;
  shares_outstanding: number;
  shares_outstanding_diluted: number;
  dividend_per_share: number;
  gross_margin: number;
  ebitda_margin: number;
  ebit_margin: number;
  profit_margin: number;
  free_cash_flow_margin: number;
  ebitda: number;
  ebit: number;
  consolidated_income: number;
  ebt_margin: number;
  net_profit_margin: number;
}

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
