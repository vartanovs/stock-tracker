import dotenv from 'dotenv';
import { camelizeKeys, decamelizeKeys } from 'humps';

import CSVClient from '../clients/csv';
import ModelingPrepClient from '../clients/modeling_prep';
import postgresClient from '../clients/postgres';

import { POSTGRES_SLEEP_TIMEOUT_MS } from '../constants/configs';
import { QUARTERLY_STOCK_PRICE_DATES } from '../constants/dates';
import { UPDATE_HISTORIC_STOCK_PRICES } from '../constants/flags';
import { STOCK_PRICE_HEADERS, STOCK_PRICES_HEADERS } from '../constants/headers';
import { sleep } from '../utils';
import { formatHistoricPrices } from '../utils/stock_prices';

import type { QueryResult } from 'pg';
import type { StockProfile, StockProfilePayload, Stock, HistoricStockPrices, StockPrice, StockPricePayload } from '../types';

dotenv.config();

const { PATH_TO_STOCK_PRICES_CSV } = process.env;

const modelingPrepClient = new ModelingPrepClient();

const stockPriceModel = {
  async seedFromAPI(stocks: Stock[]) {
    const stockPrices = await modelingPrepClient.getHistoricStockPrices(stocks);

    const stockPriceIndexes = STOCK_PRICE_HEADERS.map((_, i) => `$${i + 1}`);
    const seedQuery = `
      INSERT INTO stock_prices (${STOCK_PRICE_HEADERS.join(', ')})
      VALUES (${stockPriceIndexes.join(', ')})
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
    if (UPDATE_HISTORIC_STOCK_PRICES) await this.seedFromAPI(stocks);
    const stockProfiles = await this.getCurrent(stocks);
    const historicStockPrices = await this.getHistoric(stocks);
    const fullStockPrices = stockProfiles.map((stockProfile) => {
      const historicPrices = historicStockPrices.find(({ symbol }) => symbol === stockProfile.symbol) as HistoricStockPrices;
      return { ...stockProfile, ...historicPrices };
    });

    return fullStockPrices;
  },

  async getCurrent(stocks: Stock[]) {
    const equities = stocks.filter(({ exchangeType }) => ['nasdaq', 'nyse'].includes(exchangeType));
    const indexSymbols = stocks.filter(({ exchangeType }) => exchangeType === 'index').map(({ symbol }) => symbol);

    const equityProfiles = await modelingPrepClient.getEquityProfiles(equities);
    const indexProfiles = await modelingPrepClient.getIndexProfiles(indexSymbols);
    return [...indexProfiles, ...equityProfiles];
  },

  async getHistoric(stocks: Stock[]) {
    const HISTORIC_DATES = [...QUARTERLY_STOCK_PRICE_DATES.slice(0, 5), QUARTERLY_STOCK_PRICE_DATES[7], QUARTERLY_STOCK_PRICE_DATES[19]];
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
    const stockPricesPayload = (decamelizeKeys(stockPrices) as StockProfilePayload[]).sort((a, b) => a.symbol.localeCompare(b.symbol));
    const stockPricesCsvClient = new CSVClient(PATH_TO_STOCK_PRICES_CSV as string, STOCK_PRICES_HEADERS as string[]);
    return stockPricesCsvClient.writeCSV(stockPricesPayload);
  },
};

export default stockPriceModel;
