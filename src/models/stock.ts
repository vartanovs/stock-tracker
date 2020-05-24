import csvParser from 'csv-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import { camelizeKeys } from 'humps';

import postgresClient from '../clients/postgres';
import { POSTGRES_SLEEP_TIMEOUT_MS, UPDATE_STOCK_LIST } from '../constants';
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

  readFromCSV() {
    const stocks: StockPayload[] = [];

    const addToStockList = (data: StockPayload) => {
      if (!data.symbol) {
        const errorMessage = 'Symbol missing for stock data';
        console.error(errorMessage, { data }); // eslint-disable-line
        throw new Error('Stock data missing symbol');
      }

      stocks.push(data);
    };

    return new Promise<StockPayload[]>((resolve, reject) => {
      fs.createReadStream(PATH_TO_STOCK_LIST_CSV as string)
        .pipe(csvParser())
        .on('data', addToStockList)
        .on('error', (err) => reject(err))
        .on('end', () => resolve(stocks));
    });
  },

  async seedFromCSV() {
    const stockData = await this.readFromCSV();

    const seedQuery = `
      INSERT INTO stocks (symbol, exchange_type)
      VALUES ($1, $2)
    `;

    await postgresClient.connect();
    for (let i = 0; i < stockData.length; i += 1) {
      await sleep(POSTGRES_SLEEP_TIMEOUT_MS); // eslint-disable-line
      const { symbol, exchange_type: exchangeType } = stockData[i];
      try {
        await postgresClient.query(seedQuery, [symbol, exchangeType]); // eslint-disable-line
        console.log(`Seeded ${symbol} into "stocks" postgres table`); // eslint-disable-line
      } catch (err) {
        console.error(`Could not seed ${symbol} into "stocks" postgres table`, { err }); // eslint-disable-line
      }
    }

    await postgresClient.end();
  },
};

export default stock;
