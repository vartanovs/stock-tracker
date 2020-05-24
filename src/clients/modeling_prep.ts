import dotenv from 'dotenv';
import fetch from 'node-fetch';

import { FETCH_SLEEP_TIMEOUT_MS, FINANCIAL_STATEMENTS_START_YEAR } from '../constants';
import { chunkList, sleep } from '../utils';
import { formatModelingPrepIncomeStatement } from '../utils/modeling_prep';

import type { ModelingPrepIncomeStatements, ModelingPrepFinancialsResponse, Stock, IncomeStatementPayload } from '../types';

dotenv.config();

class ModelingPrepClient {
  constructor(
    private apiKey = process.env.FINANCIAL_MODELING_PREP_API_KEY as string,
    private endpoints: Record<string, string> = {},
    private host = 'https://financialmodelingprep.com/api/v3/'
  ) {
    this.endpoints.incomeStatement =  'financials/income-statement/';
  }

  // Given a raw API response, return formatted income statements since START_YEAR
  private static formatIncomeStatements(financialStatementList: ModelingPrepIncomeStatements[]) {
    let incomeStatements: IncomeStatementPayload[] = [];

    financialStatementList.forEach((financialStatement) => {
      const { symbol, financials } = financialStatement;
      const formattedIncomeStatement = financials
        .filter(({ date }) => new Date(date).getFullYear() >= FINANCIAL_STATEMENTS_START_YEAR)
        .map((incomeStatement) => formatModelingPrepIncomeStatement(incomeStatement, symbol));

      incomeStatements = [...incomeStatements, ...formattedIncomeStatement];
    });

    return incomeStatements;
  }

  public async getIncomeStatements(stocks: Stock[]) {
    const stockChunks = chunkList(stocks); // API limits calls to 3 stock symbols at a time
    let incomeStatements: IncomeStatementPayload[] = [];

    for (let i = 0; i < stockChunks.length; i += 1) {
      const currentChunk = stockChunks[i];
      const stockSymbols = currentChunk.map((stock) => stock.symbol);
      const uri = `${this.host}${this.endpoints.incomeStatement}${stockSymbols.join(',')}?period=quarter&apikey=${this.apiKey}`;

      let apiResponse: ModelingPrepFinancialsResponse;
      try {
        await sleep(FETCH_SLEEP_TIMEOUT_MS); // eslint-disable-line
        console.log(`Fetching income statements from: ${uri}`); // eslint-disable-line
        const rawResponse = await fetch(uri); // eslint-disable-line
        apiResponse = await rawResponse.json() as ModelingPrepFinancialsResponse; // eslint-disable-line
      } catch (err) {
        try {
          await sleep(FETCH_SLEEP_TIMEOUT_MS); // eslint-disable-line
          console.warn('Fetch Error! Retrying', err); // eslint-disable-line
          const response = await fetch(uri); // eslint-disable-line
          apiResponse = await response.json(); // eslint-disable-line
        } catch (err2) {
          console.warn(`Unable to get financials for ${stockSymbols}`); // eslint-disable-line
          return [];
        }
      }

      const { financialStatementList } = apiResponse;
      let formattedIncomeStatements: IncomeStatementPayload[] = [];
      if (Array.isArray(financialStatementList)) {
        formattedIncomeStatements = ModelingPrepClient.formatIncomeStatements(financialStatementList);
      }

      incomeStatements = [...incomeStatements, ...formattedIncomeStatements];
    }

    return incomeStatements;
  }
}

export default ModelingPrepClient;
