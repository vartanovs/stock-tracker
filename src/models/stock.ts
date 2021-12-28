import dotenv from 'dotenv';
import { camelizeKeys } from 'humps';

import CSVClient from '../clients/csv';
import postgresClient from '../clients/postgres';
import { CENTRAL_INDEX_KEY_LENGTH, NEW_STOCKS, POSTGRES_SLEEP_TIMEOUT_MS } from '../constants/configs';
import { UPDATE_STOCK_LIST } from '../constants/flags';
import { STOCK_HEADERS } from '../constants/headers';
import { sleep } from '../utils';

import type { QueryResult } from 'pg';
import type { Stock, StockPayload } from '../types';

dotenv.config();

const { PATH_TO_STOCK_LIST_CSV } = process.env;

const stock = {
  async readAll() {
    if (UPDATE_STOCK_LIST) await this.seedFromCSV();

    const getAllQuery = 'SELECT * FROM stocks';

    await postgresClient.connect();
    const response = await postgresClient.query(getAllQuery) as QueryResult<StockPayload>;
    postgresClient.end();
    return camelizeKeys(response.rows) as Stock[];
  },

  async seedFromCSV() {
    const stockCSVClient = new CSVClient(PATH_TO_STOCK_LIST_CSV as string, STOCK_HEADERS);
    let stocks: StockPayload[] = await stockCSVClient.readCSV();

    if (NEW_STOCKS.length) {
      stocks = stocks.filter(({ symbol }) => NEW_STOCKS.includes(symbol));
    }

    const seedQuery = `
      INSERT INTO stocks (symbol, exchange_type, name, central_index_key, sector, industry)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    await postgresClient.connect();
    for (let i = 0; i < stocks.length; i += 1) {
      let { symbol, exchange_type: exchangeType, name, central_index_key: centralIndexKey, sector, industry } = stocks[i];
      centralIndexKey = centralIndexKey.padStart(CENTRAL_INDEX_KEY_LENGTH, '0');
      if (!symbol || !exchangeType || !name || !centralIndexKey || !sector || !industry) break;

      try {
        await sleep(POSTGRES_SLEEP_TIMEOUT_MS); // eslint-disable-line
        await postgresClient.query(seedQuery, [symbol, exchangeType, name, centralIndexKey, sector, industry]); // eslint-disable-line
        console.log(`Seeded ${symbol} into "stocks" postgres table`); // eslint-disable-line
      } catch (err) {
        console.error(`Could not seed ${symbol} into "stocks" postgres table`, { err }); // eslint-disable-line
      }
    }

    await postgresClient.end();
  },
};

export default stock;
