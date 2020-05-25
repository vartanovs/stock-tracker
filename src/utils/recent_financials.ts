import type { IncomeStatement, RecentFinancialsPayload, Stock } from '../types';

const rekeyIncomeStatementMetrics = (incomeStatement: IncomeStatement, index: number) => ({
  [`revenue_${index + 1}`]: incomeStatement.revenue,
  [`gross_profit_${index + 1}`]: incomeStatement.grossProfit,
  [`op_income_${index + 1}`]: incomeStatement.operatingIncome,
  [`net_income_${index + 1}`]: incomeStatement.netIncomeCom,
});

export const formatIncomeStatementsToRecentFinancials = (stocks: Stock[], incomeStatements: IncomeStatement[]) => {
  const recentFinancials = stocks.map(({ exchangeType, symbol }) => {
    let recentFinancialsPayload: RecentFinancialsPayload = { exchange_type: exchangeType, symbol };

    incomeStatements
      .filter((incomeStatement) => incomeStatement.symbol === symbol)
      .map(rekeyIncomeStatementMetrics)
      .forEach((quarterlyIncomeStatementMetrics) => {
        recentFinancialsPayload = { ...recentFinancialsPayload, ...quarterlyIncomeStatementMetrics };
      });

    return recentFinancialsPayload;
  });

  return recentFinancials;
};
