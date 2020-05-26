import type { ModelingPrepIncomeStatementKey, IncomeStatementKey, StockPricePayloadKey } from './types';

export const FETCH_SLEEP_TIMEOUT_MS = 50;
export const FINANCIAL_STATEMENTS_START_YEAR = 2015;
export const FINANCIAL_STATEMENTS_COUNT = 8;
export const MODELING_PREP_INCOME_STATEMENT_CHUNK_SIZE = 3;
export const MODELING_PREP_HISTORIC_PRICES_CHUNK_SIZE = 5;
export const POSTGRES_SLEEP_TIMEOUT_MS = 50;

// Default control flags
export const UPDATE_INCOME_STATEMENTS = false;
export const UPDATE_HISTORIC_STOCK_PRICES = false;
export const UPDATE_PRICES = true;
export const UPDATE_STOCK_LIST = false;

// CSV and postgres table headers
export const RECENT_FINANCIALS_HEADERS = [
  'exchange_type', 'symbol',
  'revenue_8', 'revenue_7', 'revenue_6', 'revenue_5', 'revenue_4', 'revenue_3', 'revenue_2', 'revenue_1',
  'gross_profit_8', 'gross_profit_7', 'gross_profit_6', 'gross_profit_5', 'gross_profit_4', 'gross_profit_3', 'gross_profit_2', 'gross_profit_1',
  'op_income_8', 'op_income_7', 'op_income_6', 'op_income_5', 'op_income_4', 'op_income_3', 'op_income_2', 'op_income_1',
  'net_income_8', 'net_income_7', 'net_income_6', 'net_income_5', 'net_income_4', 'net_income_3', 'net_income_2', 'net_income_1',
];

export const STOCK_HEADERS = ['exchange_type', 'symbol'];

export const STOCK_PRICE_HEADERS: StockPricePayloadKey[] = ['exchange_type', 'symbol', 'date', 'high', 'low'];

// Historic stock prices
export const HISTROIC_PRICES_FROM_DATE = '2020-04-01';

export const QUARTERLY_STOCK_PRICE_DATES = [
  '2020-04-01', '2020-01-02',
  '2019-10-01', '2019-07-01', '2019-04-01', '2019-01-02',
  '2018-10-01', '2018-07-02', '2018-04-02', '2018-01-02',
  '2017-10-02', '2017-07-03', '2017-04-03', '2017-01-03',
  '2016-10-03', '2016-07-01', '2016-04-01', '2016-01-04',
  '2015-10-01', '2015-07-01', '2015-04-01', '2015-01-02',
];

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
