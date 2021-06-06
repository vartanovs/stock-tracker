import dotenv from 'dotenv';
import { camelizeKeys } from 'humps';

import CSVClient from '../clients/csv';
import { FINANCIAL_STATEMENTS_COUNT, NEW_STOCKS, POSTGRES_SLEEP_TIMEOUT_MS } from '../constants/configs';
import { incomeStatementKeysToModelingPrepDict } from '../constants/dicts';
import { UPDATE_INCOME_STATEMENTS, UPSERT_INCOME_STATEMENTS } from '../constants/flags';
import { INCOME_STATEMENT_HEADERS } from '../constants/headers';
import { sleep } from '../utils';

import EdgarClient from '../clients/edgar';
import postgresClient from '../clients/postgres';

import type { QueryResult } from 'pg';
import type { IncomeStatementPayload, IncomeStatement } from '../types';
import type { EdgarIncomeStatementPayload } from '../types/edgar';

dotenv.config();

const { PATH_TO_INCOME_STATEMENT_CORRECTIONS_CSV } = process.env;

const edgarClient = new EdgarClient();

const incomeStatementsModel = {
  async readAll(equities: string[]) {
    if (UPDATE_INCOME_STATEMENTS) await this.seedFromAPI(equities);
    if (UPSERT_INCOME_STATEMENTS) await this.seedFromCSV();

    // Retrieve key fields from most recent income statements
    const readAllQuery = `
      SELECT symbol, date, revenue, gross_profit, operating_income, net_income_com FROM
        (
          SELECT symbol, date, revenue, gross_profit, operating_income, net_income_com, rank() OVER (PARTITION BY symbol ORDER BY DATE DESC)
          FROM income_statements
        ) income_statements_ordered_by_date
      WHERE RANK <= ${FINANCIAL_STATEMENTS_COUNT}
      ORDER BY symbol, rank
    `;

    await postgresClient.connect();
    const response = await postgresClient.query(readAllQuery) as QueryResult<IncomeStatementPayload>;
    postgresClient.end();
    return camelizeKeys(response.rows) as IncomeStatement[];
  },

  async seedFromAPI(equities: string[]) {
    const equitiesToSeed = NEW_STOCKS.length ? equities.filter((stock) => NEW_STOCKS.includes(stock)) : [...equities];
    const incomeStatements = await edgarClient.getIncomeStatements(equitiesToSeed);

    type IncomeStatementKey = keyof EdgarIncomeStatementPayload;
    const incomeStatementKeys = ['symbol', ...Object.keys(incomeStatementKeysToModelingPrepDict)] as IncomeStatementKey[];
    const incomeStatementIndexes = incomeStatementKeys.map((_, i) => `$${i + 1}`);

    const seedQuery = `
      INSERT INTO income_statements (${incomeStatementKeys.join(', ')})
      VALUES (${incomeStatementIndexes.join(', ')})
    `;

    await postgresClient.connect();
    for (let i = 0; i < incomeStatements.length; i += 1) {
      await sleep(POSTGRES_SLEEP_TIMEOUT_MS); // eslint-disable-line
      const { symbol, date } = incomeStatements[i];
      const incomeStatementValues = incomeStatementKeys.map((key) => incomeStatements[i][key]);
      try {
        await postgresClient.query(seedQuery, incomeStatementValues); // eslint-disable-line
        console.log(`Seeded ${symbol} - ${date} data into "income_statement" postgres table`); // eslint-disable-line
      } catch (err) {
        console.error(`Could not seed ${symbol} into "stocks" postgres table`, { err }); // eslint-disable-line
      }
    }

    await postgresClient.end();
  },

  async seedFromCSV() {
    const incomeStatementCorrectionsCSVClient = new CSVClient(PATH_TO_INCOME_STATEMENT_CORRECTIONS_CSV as string, INCOME_STATEMENT_HEADERS);
    const incomeStatementCorrections = await incomeStatementCorrectionsCSVClient.readCSV();

    const upsertQuery = `
      INSERT INTO income_statements (symbol, date, revenue, gross_profit, operating_income, net_income_com)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (symbol, date) DO UPDATE
      SET
        revenue = EXCLUDED.revenue,
        gross_profit = EXCLUDED.gross_profit,
        operating_income = EXCLUDED.operating_income,
        net_income_com = EXCLUDED.net_income_com
    `;

    await postgresClient.connect();
    for (let i = 0; i < incomeStatementCorrections.length; i += 1) {
      const {
        symbol, date, revenue,
        gross_profit: grossProfit, operating_income: operatingIncome, net_income_com: netIncomeCom,
      } = incomeStatementCorrections[i];
      if (!symbol || !date || !revenue || !grossProfit || !operatingIncome || !netIncomeCom) break;

      try {
        await sleep(POSTGRES_SLEEP_TIMEOUT_MS); // eslint-disable-line
        await postgresClient.query(upsertQuery, [symbol, date, revenue, grossProfit, operatingIncome, netIncomeCom]); // eslint-disable-line
        console.log(`Upserted ${symbol} - ${date} into "income_statements" postgres table`); // eslint-disable-line
      } catch (err) {
        console.error(`Could not upsert ${symbol} - ${date} into "income_statements" postgres table`, { err }); // eslint-disable-line
      }
    }

    await postgresClient.end();
  },
};

export default incomeStatementsModel;
