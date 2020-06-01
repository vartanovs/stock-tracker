import { camelizeKeys } from 'humps';

import { FINANCIAL_STATEMENTS_COUNT, POSTGRES_SLEEP_TIMEOUT_MS } from '../constants/configs';
import { incomeStatementKeysToModelingPrepDict } from '../constants/dicts';
import { UPDATE_INCOME_STATEMENTS } from '../constants/flags';
import { sleep } from '../utils';

import ModelingPrepClient from '../clients/modeling_prep';
import postgresClient from '../clients/postgres';

import type { QueryResult } from 'pg';
import type { ExtendedIncomeStatementPayload, IncomeStatementPayload, IncomeStatement } from '../types';

const modelingPrepClient = new ModelingPrepClient();

const incomeStatementsModel = {
  async readAll(equities: string[]) {
    if (UPDATE_INCOME_STATEMENTS) await this.seedFromAPI(equities);

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
    const incomeStatements = await modelingPrepClient.getIncomeStatements(equities);

    type IncomeStatementKey = keyof ExtendedIncomeStatementPayload;
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
};

export default incomeStatementsModel;
