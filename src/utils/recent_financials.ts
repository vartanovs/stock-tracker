import type { IncomeStatement, RecentFinancialsPayload, Stock } from '../types';

const alphabetizeFinancialsPayloads = (stockA: RecentFinancialsPayload, stockB: RecentFinancialsPayload) => {
  if (stockA.symbol > stockB.symbol) return 1;
  if (stockA.symbol < stockB.symbol) return -1;
  return 0;
};

const rekeyIncomeStatementMetrics = (incomeStatement: IncomeStatement, index: number) => ({
  [`revenue_${index + 1}`]: incomeStatement.revenue,
  [`gross_profit_${index + 1}`]: incomeStatement.grossProfit,
  [`op_income_${index + 1}`]: incomeStatement.operatingIncome,
  [`net_income_${index + 1}`]: incomeStatement.netIncomeCom,
});

export const formatIncomeStatementsToRecentFinancials = (stocks: Stock[], incomeStatements: IncomeStatement[]) => {
  const recentFinancials = stocks.map(({ exchangeType, symbol, name }) => {
    const stockIncomeStatements = incomeStatements.filter((incomeStatement) => incomeStatement.symbol === symbol);
    const latestFinancialsDate = stockIncomeStatements[0] ? stockIncomeStatements[0].date.toISOString().split('T')[0] : '';

    let recentFinancialsPayload: RecentFinancialsPayload = { exchange_type: exchangeType, symbol, name, as_of: latestFinancialsDate };
    stockIncomeStatements
      .map(rekeyIncomeStatementMetrics)
      .forEach((quarterlyIncomeStatementMetrics) => {
        recentFinancialsPayload = { ...recentFinancialsPayload, ...quarterlyIncomeStatementMetrics };
      });

    return recentFinancialsPayload;
  }).sort(alphabetizeFinancialsPayloads);

  return recentFinancials;
};
