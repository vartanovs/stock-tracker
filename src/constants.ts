import type { ModelingPrepIncomeStatementKey, IncomeStatementKey } from './types';

export const FETCH_SLEEP_TIMEOUT_MS = 50;
export const FINANCIAL_STATEMENTS_START_YEAR = 2015;
export const MODELING_PREP_STOCK_CHUNK_SIZE = 3;
export const POSTGRES_SLEEP_TIMEOUT_MS = 50;

// Default control flags
export const UPDATE_INCOME_STATEMENTS = true;
export const UPDATE_PRICES = true;
export const UPDATE_STOCK_LIST = false;

// Modeling Prep API <> Income Statement
export const modelingPrepKeysToIncomeStatementDict: Record<ModelingPrepIncomeStatementKey, IncomeStatementKey> = {
  'date': 'date',
  'Revenue': 'revenue',
  'Revenue Growth': 'revenue_growth',
  'Cost of Revenue': 'cost_of_revenue',
  'Gross Profit': 'gross_profit',
  'R&D Expenses': 'rd_expense',
  'SG&A Expense': 'sga_expense',
  'Operating Expenses': 'operating_expense',
  'Operating Income': 'operating_income',
  'Interest Expense': 'interest_expense',
  'Earnings before Tax': 'ebt',
  'Income Tax Expense': 'income_tax_expense',
  'Net Income - Non-Controlling int': 'net_income_non_controlling',
  'Net Income - Discontinued ops': 'net_income_discontinued',
  'Net Income': 'net_income',
  'Preferred Dividends': 'preferred_dividends',
  'Net Income Com': 'net_income_com',
  'EPS': 'eps',
  'EPS Diluted': 'eps_diluted',
  'Weighted Average Shs Out': 'shares_outstanding',
  'Weighted Average Shs Out (Dil)': 'shares_outstanding_diluted',
  'Dividend per Share': 'dividend_per_share',
  'Gross Margin': 'gross_margin',
  'EBITDA Margin': 'ebitda_margin',
  'EBIT Margin': 'ebit_margin',
  'Profit Margin': 'profit_margin',
  'Free Cash Flow margin': 'free_cash_flow_margin',
  'EBITDA': 'ebitda',
  'EBIT': 'ebit',
  'Consolidated Income': 'consolidated_income',
  'Earnings Before Tax Margin': 'ebt_margin',
  'Net Profit Margin': 'net_profit_margin',
};

export const incomeStatementKeysToModelingPrepDict: Record<Exclude<IncomeStatementKey, 'symbol'>, ModelingPrepIncomeStatementKey> = {
  date: 'date',
  revenue: 'Revenue',
  revenue_growth: 'Revenue Growth',
  cost_of_revenue: 'Cost of Revenue',
  gross_profit: 'Gross Profit',
  rd_expense: 'R&D Expenses',
  sga_expense: 'SG&A Expense',
  operating_expense: 'Operating Expenses',
  operating_income: 'Operating Income',
  interest_expense: 'Interest Expense',
  ebt: 'Earnings before Tax',
  income_tax_expense: 'Income Tax Expense',
  net_income_non_controlling: 'Net Income - Non-Controlling int',
  net_income_discontinued: 'Net Income - Discontinued ops',
  net_income: 'Net Income',
  preferred_dividends: 'Preferred Dividends',
  net_income_com: 'Net Income Com',
  eps: 'EPS',
  eps_diluted: 'EPS Diluted',
  shares_outstanding: 'Weighted Average Shs Out',
  shares_outstanding_diluted: 'Weighted Average Shs Out (Dil)',
  dividend_per_share: 'Dividend per Share',
  gross_margin: 'Gross Margin',
  ebitda_margin: 'EBITDA Margin',
  ebit_margin: 'EBIT Margin',
  profit_margin: 'Profit Margin',
  free_cash_flow_margin: 'Free Cash Flow margin',
  ebitda: 'EBITDA',
  ebit: 'EBIT',
  consolidated_income: 'Consolidated Income',
  ebt_margin: 'Earnings Before Tax Margin',
  net_profit_margin: 'Net Profit Margin',
};
