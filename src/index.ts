import cryptoModel from './models/crypto';
import incomeStatementModel from './models/income_statements';
import recentFinancialsModel from './models/recent_financials';
import stockModel from './models/stock';
import stockPriceModel from './models/stock_price';
import { formatIncomeStatementsToRecentFinancials } from './utils/recent_financials';

const main = async () => {
  const stocks = await stockModel.readAll();
  const equitySymbols = stocks
    .filter((stock) => stock.exchangeType === 'nyse' || stock.exchangeType === 'nasdaq')
    .map(({ symbol }) => symbol);

  const incomeStatements = await incomeStatementModel.readAll(equitySymbols);

  const recentFinancials = formatIncomeStatementsToRecentFinancials(stocks, incomeStatements);
  recentFinancialsModel.saveAll(recentFinancials);

  const stockPrices = await stockPriceModel.getAll(stocks);
  await stockPriceModel.saveAll(stockPrices);

  const cryptoPrices = await cryptoModel.getAll();
  await cryptoModel.saveAll(cryptoPrices);
};

main();
