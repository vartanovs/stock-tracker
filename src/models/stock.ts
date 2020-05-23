import csvParser from 'csv-parser';
import dotenv from 'dotenv';
import fs from 'fs';

import type { Stock } from '../types';

dotenv.config();

const { PATH_TO_STOCK_LIST_CSV } = process.env;

const stock = {
  readAll() {
    const stocks: Stock[] = [];

    const addToStockList = (data: Stock) => {
      if (!data.symbol) {
        const errorMessage = 'Symbol missing for stock data';
        console.error(errorMessage, { data }); // eslint-disable-line
        throw new Error('Stock data missing symbol');
      }

      stocks.push(data);
    };

    return new Promise((resolve, reject) => {
      fs.createReadStream(PATH_TO_STOCK_LIST_CSV as string)
        .pipe(csvParser())
        .on('data', addToStockList)
        .on('error', (err) => reject(err))
        .on('end', () => resolve(stocks));
    });
  },
};

export default stock;
