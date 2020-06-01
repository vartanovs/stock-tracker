import { roundMillion, roundRatio } from '.';
import { QUARTERLY_STOCK_PRICE_DATES } from '../constants/dates';
import { incomeStatementKeysToModelingPrepDict } from '../constants/dicts';

import type { ExtendedIncomeStatementPayload, ExtendedIncomeStatementPayloadKey, StockPricePayload } from '../types';
import type { ModelingPrepHistoricPrice, ModelingPrepIncomeStatement, ModelingPrepHistoricPrices } from '../types/modeling_prep';

export const formatIncomeStatementValue = (incomeStatementKey: ExtendedIncomeStatementPayloadKey, unformattedValue: string) => {
  const LARGE_NUMBERS: ExtendedIncomeStatementPayloadKey[] = [
    'revenue',
    'cost_of_revenue',
    'gross_profit',
    'rd_expense',
    'sga_expense',
    'operating_expense',
    'operating_income',
    'interest_expense',
    'ebt',
    'income_tax_expense',
    'net_income_non_controlling',
    'net_income_discontinued',
    'net_income',
    'preferred_dividends',
    'net_income_com',
    'shares_outstanding',
    'shares_outstanding_diluted',
    'ebitda',
    'ebit',
    'consolidated_income',
  ];

  const RATIOS_AND_MARGINS: ExtendedIncomeStatementPayloadKey[] = [
    'revenue_growth',
    'eps',
    'eps_diluted',
    'dividend_per_share',
    'gross_margin',
    'ebitda_margin',
    'ebit_margin',
    'profit_margin',
    'free_cash_flow_margin',
    'ebt_margin',
    'net_profit_margin',
  ];

  if (LARGE_NUMBERS.includes(incomeStatementKey)) return roundMillion(unformattedValue);
  if (RATIOS_AND_MARGINS.includes(incomeStatementKey)) return roundRatio(unformattedValue);
  throw new Error(`Unexpected income statement key ${incomeStatementKey} cannot be formatted`);
};

export const formatModelingPrepHistoricStockPrice = (modelingPrepHistoricStockPrice: ModelingPrepHistoricPrice, symbol: string) => {
  const { date, high, low } = modelingPrepHistoricStockPrice;
  return { symbol, date, high, low } as StockPricePayload;
};

export const formatModelingPrepHistoricStockPrices = (historicalStockStatement: ModelingPrepHistoricPrices) => {
  const { symbol, historical } = historicalStockStatement;
  if (!symbol || !historical) return [];
  return historical
    .filter(({ date }) => QUARTERLY_STOCK_PRICE_DATES.includes(date))
    .map((historicStockPrice) => formatModelingPrepHistoricStockPrice(historicStockPrice, symbol));
};

export const formatModelingPrepIncomeStatement = (modelingPrepIncomeStatement: ModelingPrepIncomeStatement, symbol: string) => {
  // Convert from Modeling Prep keys to postgres snake_case keys
  const incomeStatementPayload: ExtendedIncomeStatementPayload = {
    symbol,
    date: modelingPrepIncomeStatement.date,
    revenue: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.revenue],
    revenue_growth: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.revenue_growth],
    cost_of_revenue: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.cost_of_revenue],
    gross_profit: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.gross_profit],
    rd_expense: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.rd_expense],
    sga_expense: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.sga_expense],
    operating_expense: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.operating_expense],
    operating_income: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.operating_income],
    interest_expense: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.interest_expense],
    ebt: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.ebt],
    income_tax_expense: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.income_tax_expense],
    net_income_non_controlling: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.net_income_non_controlling],
    net_income_discontinued: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.net_income_discontinued],
    net_income: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.net_income],
    preferred_dividends: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.preferred_dividends],
    net_income_com: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.net_income_com],
    eps: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.eps],
    eps_diluted: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.eps_diluted],
    shares_outstanding: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.shares_outstanding],
    shares_outstanding_diluted: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.shares_outstanding_diluted],
    dividend_per_share: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.dividend_per_share],
    gross_margin: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.gross_margin],
    ebitda_margin: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.ebitda_margin],
    ebit_margin: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.ebit_margin],
    profit_margin: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.profit_margin],
    free_cash_flow_margin: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.free_cash_flow_margin],
    ebitda: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.ebitda],
    ebit: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.ebit],
    consolidated_income: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.consolidated_income],
    ebt_margin: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.ebt_margin],
    net_profit_margin: modelingPrepIncomeStatement[incomeStatementKeysToModelingPrepDict.net_profit_margin],
  };

  // Round large numbers to nearest million and ratios/margins to 3 decimals
  (Object.keys(incomeStatementPayload) as ExtendedIncomeStatementPayloadKey[]).forEach((incomeStatementKey) => {
    if (['symbol', 'date'].includes(incomeStatementKey)) return; // symbol and date do not require formatting
    incomeStatementPayload[incomeStatementKey] = formatIncomeStatementValue(incomeStatementKey, incomeStatementPayload[incomeStatementKey]);
  });

  return incomeStatementPayload;
};
