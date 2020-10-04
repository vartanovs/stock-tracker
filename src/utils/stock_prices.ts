import { QUARTERLY_STOCK_PRICE_DATES } from '../constants/dates';

import type { Stock, StockPrice } from '../types';

const [lastQtDate, twoQtDate, threeQtDate, lastYrDate, fiveQtDate, sixQtPrice] = QUARTERLY_STOCK_PRICE_DATES;
const twoYrDate = QUARTERLY_STOCK_PRICE_DATES[7];
const fiveYrDate = QUARTERLY_STOCK_PRICE_DATES[19];

const getRoundedStockPrice = (stockPrice?: StockPrice) => {
  if (!stockPrice) return 0;
  const { low, high } = stockPrice;
  return Math.floor((low + high) / 2);
};

export const formatHistoricPrices = (stocks: Stock[], historicPrices: StockPrice[]) => stocks
  .map((stock) => {
    const historicStockPrices = historicPrices.filter(({ symbol }) => symbol === stock.symbol);
    return {
      ...stock,
      lastQtPrice: getRoundedStockPrice(historicStockPrices.find(({ date }) => (date as Date).toISOString().split('T')[0] === lastQtDate)),
      twoQtPrice: getRoundedStockPrice(historicStockPrices.find(({ date }) => (date as Date).toISOString().split('T')[0] === twoQtDate)),
      threeQtPrice: getRoundedStockPrice(historicStockPrices.find(({ date }) => (date as Date).toISOString().split('T')[0] === threeQtDate)),
      lastYrPrice: getRoundedStockPrice(historicStockPrices.find(({ date }) => (date as Date).toISOString().split('T')[0] === lastYrDate)),
      fiveQtPrice: getRoundedStockPrice(historicStockPrices.find(({ date }) => (date as Date).toISOString().split('T')[0] === fiveQtDate)),
      sixQtPrice: getRoundedStockPrice(historicStockPrices.find(({ date }) => (date as Date).toISOString().split('T')[0] === sixQtPrice)),
      twoYrPrice: getRoundedStockPrice(historicStockPrices.find(({ date }) => (date as Date).toISOString().split('T')[0] === twoYrDate)),
      fiveYrPrice: getRoundedStockPrice(historicStockPrices.find(({ date }) => (date as Date).toISOString().split('T')[0] === fiveYrDate)),
    };
  });
