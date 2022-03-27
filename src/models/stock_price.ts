import dotenv from 'dotenv';
import { camelizeKeys, decamelizeKeys } from 'humps';

import AlpacaClient from '../clients/alpaca';
import CSVClient from '../clients/csv';
import FinnhubClient from '../clients/finnhub';
import ModelingPrepClient from '../clients/modeling_prep';
import postgresClient from '../clients/postgres';

import { NEW_STOCKS, POSTGRES_SLEEP_TIMEOUT_MS } from '../constants/configs';
import { QUARTERLY_STOCK_PRICE_DATES } from '../constants/dates';
import { UPDATE_HISTORIC_STOCK_PRICES, UPDATE_STOCK_PRICES } from '../constants/flags';
import { STOCK_PRICE_HEADERS, STOCK_PRICES_HEADERS } from '../constants/headers';
import { sleep } from '../utils';
import { formatHistoricPrices } from '../utils/stock_prices';

import type { QueryResult } from 'pg';
import type { StockProfile, StockProfilePayload, Stock, HistoricStockPrices, StockPrice, StockPricePayload, CurrentStockProfile } from '../types';

dotenv.config();

const { PATH_TO_STOCK_PRICES_CSV } = process.env;

const alpacaClient = new AlpacaClient();
const finnhubClient = new FinnhubClient();
const modelingPrepClient = new ModelingPrepClient();

const stockPriceModel = {
  async seedFromAPI(stocks: Stock[]) {
    const stocksToSeed = NEW_STOCKS.length ? stocks.filter(({ symbol }) => NEW_STOCKS.includes(symbol)) : [...stocks];
    const stockPrices = await modelingPrepClient.getHistoricStockPrices(stocksToSeed);

    const stockPriceIndexes = STOCK_PRICE_HEADERS.map((_, i) => `$${i + 1}`);
    const seedQuery = `
      INSERT INTO stock_prices (${STOCK_PRICE_HEADERS.join(', ')})
      VALUES (${stockPriceIndexes.join(', ')})
      ON CONFLICT (symbol, date) DO UPDATE
      SET
        exchange_type = EXCLUDED.exchange_type,
        symbol = EXCLUDED.symbol,
        date = EXCLUDED.date,
        high = EXCLUDED.high,
        low = EXCLUDED.low
    `;

    await postgresClient.connect();
    for (let i = 0; i < stockPrices.length; i += 1) {
      await sleep(POSTGRES_SLEEP_TIMEOUT_MS); // eslint-disable-line
      const { symbol, date } = stockPrices[i];
      const stockPriceValues = STOCK_PRICE_HEADERS.map((header) => String(stockPrices[i][header]));
      try {
        await postgresClient.query(seedQuery, stockPriceValues); // eslint-disable-line
        console.log(`Seeded ${symbol} - ${date} data into "stock_prices" postgres table`); // eslint-disable-line
      } catch (err) {
        console.error(`Could not seed ${symbol} into "stock_prices" postgres table`, { err }); // eslint-disable-line
      }
    }

    await postgresClient.end();
  },

  async getAll(stocks: Stock[]): Promise<StockProfile[]> {
    if (!UPDATE_STOCK_PRICES) return [];
    if (UPDATE_HISTORIC_STOCK_PRICES) await this.seedFromAPI(stocks);
    const equities = stocks.filter(({ exchangeType }) => ['nasdaq', 'nyse'].includes(exchangeType));
    const indexes = stocks.filter(({ exchangeType }) => exchangeType === 'index');

    const indexProfiles = await modelingPrepClient.getIndexProfiles(indexes);
    const equityProfiles = await finnhubClient.getEquityProfiles(equities);
    const currentEquityPrices = await alpacaClient.getCurrentEquityPrices(equities);
    const historicStockPrices = await this.getHistoric(stocks);
    const fullStockPrices = stocks.map((stock) => {
      const { exchangeType, symbol } = stock;
      const historicPrices = historicStockPrices.find((historicRecord) => historicRecord.symbol === symbol) as HistoricStockPrices;
      if (exchangeType === 'index') {
        // indexes include mktCap, price and shares as part of their profile
        const profile = indexProfiles.find((indexProfile) => indexProfile.symbol === symbol);
        const { mktCap, price, shares } = profile as CurrentStockProfile;
        return { ...stock, mktCap, price, shares, ...historicPrices };
      }

      // equities require two calls: one to get price, another to get mktCap and shares
      const equityPrice = currentEquityPrices[symbol];
      const equityProfile = equityProfiles[symbol];
      return { ...stock, ...equityProfile, ...historicPrices, price: equityPrice };
    });

    return fullStockPrices;
  },

  async getCurrent(stocks: Stock[]) {
    const equities = stocks.filter(({ exchangeType }) => ['nasdaq', 'nyse'].includes(exchangeType));
    const indexes = stocks.filter(({ exchangeType }) => exchangeType === 'index');

    const equityProfiles = await modelingPrepClient.getEquityProfiles(equities);
    const indexProfiles = await modelingPrepClient.getIndexProfiles(indexes);
    return [...indexProfiles, ...equityProfiles];
  },

  async getHistoric(stocks: Stock[]) {
    const HISTORIC_DATES = [...QUARTERLY_STOCK_PRICE_DATES.slice(0, 6), QUARTERLY_STOCK_PRICE_DATES[7], QUARTERLY_STOCK_PRICE_DATES[19]];
    const getAllQuery = `
      SELECT exchange_type, symbol, date, high, low
      FROM stock_prices
      WHERE date = ANY($1) AND symbol = ANY($2)
      ORDER BY symbol, DATE DESC;
    `;

    const getAllValues = [HISTORIC_DATES, stocks.map(({ symbol }) => symbol)];

    await postgresClient.connect();
    const response = await postgresClient.query(getAllQuery, getAllValues) as QueryResult<StockPricePayload>;
    postgresClient.end();

    const stockPrices = camelizeKeys(response.rows) as StockPrice[];
    return formatHistoricPrices(stocks, stockPrices) as HistoricStockPrices[];
  },

  saveAll(stockPrices: StockProfile[]) {
    if (!UPDATE_STOCK_PRICES) return null;
    const stockPricesPayload = (decamelizeKeys(stockPrices) as StockProfilePayload[]).sort((a, b) => a.symbol.localeCompare(b.symbol));
    const stockPricesCsvClient = new CSVClient(PATH_TO_STOCK_PRICES_CSV as string, STOCK_PRICES_HEADERS as string[]);
    return stockPricesCsvClient.writeCSV(stockPricesPayload);
  },
};

export default stockPriceModel;
