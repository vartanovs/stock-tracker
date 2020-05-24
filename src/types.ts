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
export type IncomeStatementKey = keyof IncomeStatementPayload;

export interface IncomeStatementPayload {
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
