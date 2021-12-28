// CSV and Postgres table headers

import type { CryptoPricePayloadKey, HistoricStockPricesPayloadKey, IncomeStatementPayloadKey, RecentFinancialsPayloadKey, StockPayloadKey, StockPricePayloadKey } from '../types';

export const CRYPTO_PRICES_HEADERS: CryptoPricePayloadKey[] = [
  'rank', 'symbol', 'name', 'price',
  'market_cap', 'last_day_change', 'last_week_change', 'last_month_change', 'two_months_change', 'three_months_change',
];

export const INCOME_STATEMENT_HEADERS: IncomeStatementPayloadKey[] = [
  'symbol', 'date', 'revenue', 'gross_profit', 'operating_income', 'net_income_com',
];

export const RECENT_FINANCIALS_HEADERS: RecentFinancialsPayloadKey[] = [
  'exchange_type', 'symbol', 'as_of',
  'revenue_8', 'revenue_7', 'revenue_6', 'revenue_5', 'revenue_4', 'revenue_3', 'revenue_2', 'revenue_1',
  'gross_profit_8', 'gross_profit_7', 'gross_profit_6', 'gross_profit_5', 'gross_profit_4', 'gross_profit_3', 'gross_profit_2', 'gross_profit_1',
  'op_income_8', 'op_income_7', 'op_income_6', 'op_income_5', 'op_income_4', 'op_income_3', 'op_income_2', 'op_income_1',
  'net_income_8', 'net_income_7', 'net_income_6', 'net_income_5', 'net_income_4', 'net_income_3', 'net_income_2', 'net_income_1',
];

export const STOCK_HEADERS: StockPayloadKey[] = ['exchange_type', 'symbol', 'name', 'central_index_key', 'sector', 'industry'];

export const STOCK_PRICE_HEADERS: StockPricePayloadKey[] = ['exchange_type', 'symbol', 'date', 'high', 'low'];

export const STOCK_PRICES_HEADERS: HistoricStockPricesPayloadKey[] = [
  'exchange_type', 'symbol', 'name', 'sector', 'industry', 'price', 'shares', 'mkt_cap',
  'last_qt_price', 'two_qt_price', 'three_qt_price', 'last_yr_price', 'five_qt_price', 'six_qt_price', 'two_yr_price', 'five_yr_price',
];
