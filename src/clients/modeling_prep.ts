import dotenv from 'dotenv';
import fetch from 'node-fetch';

import {
  FETCH_SLEEP_TIMEOUT_MS,
  FINANCIAL_STATEMENTS_START_YEAR,
  HISTROIC_PRICES_FROM_DATE,
  MODELING_PREP_HISTORIC_PRICES_CHUNK_SIZE,
  MODELING_PREP_INCOME_STATEMENT_CHUNK_SIZE,
} from '../constants';

import { chunkList, sleep } from '../utils';
import {
  formatModelingPrepHistoricStockPrices,
  formatModelingPrepIncomeStatement,
} from '../utils/modeling_prep';

import type { ModelingPrepIncomeStatements, ModelingPrepFinancialsResponse, FullIncomeStatementPayload, Stock, ModelingPrepHistoricPriceResponse, ModelingPrepHistoricPrices, StockPricePayload } from '../types';

dotenv.config();

class ModelingPrepClient {
  constructor(
    private apiKey = process.env.FINANCIAL_MODELING_PREP_API_KEY as string,
    private endpoints: Record<string, string> = {},
    private host = 'https://financialmodelingprep.com/api/v3/'
  ) {
    this.endpoints.historicPrice = 'historical-price-full/';
    this.endpoints.incomeStatement =  'financials/income-statement/';
  }

  // Given a raw API response, return quarterly formatted historic stock prices
  private static formatHistoricStockPrices(historicalStockList: ModelingPrepHistoricPrices[]) {
    let historicStockPrices: StockPricePayload[] = [];

    historicalStockList
      .map(formatModelingPrepHistoricStockPrices)
      .forEach((formattedStockPricePayloads) => {
        historicStockPrices = [...historicStockPrices, ...formattedStockPricePayloads];
      });

    return historicStockPrices;
  }

  // Given a raw API response, return formatted income statements since START_YEAR
  private static formatRecentIncomeStatements(financialStatementList: ModelingPrepIncomeStatements[]) {
    let incomeStatements: FullIncomeStatementPayload[] = [];

    financialStatementList.forEach((financialStatement) => {
      const { symbol, financials } = financialStatement;
      const formattedIncomeStatement = financials
        .filter(({ date }) => new Date(date).getFullYear() >= FINANCIAL_STATEMENTS_START_YEAR)
        .map((incomeStatement) => formatModelingPrepIncomeStatement(incomeStatement, symbol));

      incomeStatements = [...incomeStatements, ...formattedIncomeStatement];
    });

    return incomeStatements;
  }

  public async getIncomeStatements(equities: string[]) {
    const equitySymbolChunks = chunkList(equities, MODELING_PREP_INCOME_STATEMENT_CHUNK_SIZE); // API limits calls to 3 stock symbols at a time
    let incomeStatements: FullIncomeStatementPayload[] = [];

    for (let i = 0; i < equitySymbolChunks.length; i += 1) {
      const currentChunk = equitySymbolChunks[i];
      const uri = `${this.host}${this.endpoints.incomeStatement}${currentChunk.join(',')}?period=quarter&apikey=${this.apiKey}`;

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
          console.warn(`Unable to get financials for ${currentChunk}`); // eslint-disable-line
          return [];
        }
      }

      const { financialStatementList } = apiResponse;
      let formattedIncomeStatements: FullIncomeStatementPayload[] = [];
      if (Array.isArray(financialStatementList)) {
        formattedIncomeStatements = ModelingPrepClient.formatRecentIncomeStatements(financialStatementList);
      }

      incomeStatements = [...incomeStatements, ...formattedIncomeStatements];
    }

    return incomeStatements;
  }

  public async getHistoricStockPrices(stocks: Stock[]) {
    const indexes = stocks.filter(({ exchangeType }) => exchangeType === 'index');

    let historicStockPrices: StockPricePayload[] = [];

    for (let i = 0; i < indexes.length; i += 1) {
      const { symbol: indexSymbol } = indexes[i];
      const uri = `${this.host}${this.endpoints.historicPrice}${indexSymbol}?from=${HISTROIC_PRICES_FROM_DATE}&apikey=${this.apiKey}`;

      let apiResponse: ModelingPrepHistoricPrices;
      try {
        await sleep(FETCH_SLEEP_TIMEOUT_MS); // eslint-disable-line
        console.log(`Fetching historic prices from: ${uri}`); // eslint-disable-line
        const rawResponse = await fetch(uri); // eslint-disable-line
        apiResponse = await rawResponse.json() as ModelingPrepHistoricPrices; // eslint-disable-line
      } catch (err) {
        try {
          await sleep(FETCH_SLEEP_TIMEOUT_MS); // eslint-disable-line
          console.warn('Fetch Error! Retrying', err); // eslint-disable-line
          const response = await fetch(uri); // eslint-disable-line
          apiResponse = await response.json(); // eslint-disable-line
        } catch (err2) {
          console.warn(`Unable to get financials for ${indexSymbol}`); // eslint-disable-line
          return [];
        }
      }

      const formattedHistoricalIndexPrices = formatModelingPrepHistoricStockPrices(apiResponse);
      historicStockPrices = [...historicStockPrices, ...formattedHistoricalIndexPrices];
    }

    const equities = stocks
      .filter(({ exchangeType }) => exchangeType === 'nyse' || exchangeType === 'nasdaq')
      .map(({ symbol }) => symbol);

    const equitySymbolChunks = chunkList(equities, MODELING_PREP_HISTORIC_PRICES_CHUNK_SIZE); // API limits calls to 5 stock symbols at a time

    for (let i = 0; i < equitySymbolChunks.length; i += 1) {
      const currentChunk = equitySymbolChunks[i];
      const uri = `${this.host}${this.endpoints.historicPrice}${currentChunk.join(',')}?from=${HISTROIC_PRICES_FROM_DATE}&apikey=${this.apiKey}`;

      let apiResponse: ModelingPrepHistoricPriceResponse;
      try {
        await sleep(FETCH_SLEEP_TIMEOUT_MS); // eslint-disable-line
        console.log(`Fetching historic prices from: ${uri}`); // eslint-disable-line
        const rawResponse = await fetch(uri); // eslint-disable-line
        apiResponse = await rawResponse.json() as ModelingPrepHistoricPriceResponse; // eslint-disable-line
      } catch (err) {
        try {
          await sleep(FETCH_SLEEP_TIMEOUT_MS); // eslint-disable-line
          console.warn('Fetch Error! Retrying', err); // eslint-disable-line
          const response = await fetch(uri); // eslint-disable-line
          apiResponse = await response.json(); // eslint-disable-line
        } catch (err2) {
          console.warn(`Unable to get financials for ${currentChunk}`); // eslint-disable-line
          return [];
        }
      }

      const { historicalStockList } = apiResponse;
      let formattedHistoricStockPrices: StockPricePayload[] = [];
      if (Array.isArray(historicalStockList)) {
        formattedHistoricStockPrices = ModelingPrepClient.formatHistoricStockPrices(historicalStockList);
      }

      historicStockPrices = [...historicStockPrices, ...formattedHistoricStockPrices];
    }

    // Add exchange_type to each historical stock price
    const historicalStockPricesWithExchangeType: StockPricePayload[] = historicStockPrices.map(
      (historicStockPrice) => {
        const { exchangeType } = stocks.find(({ symbol }) => historicStockPrice.symbol === symbol)!;
        return { ...historicStockPrice, exchange_type: exchangeType };
      }
    );

    return historicalStockPricesWithExchangeType;
  }
}

export default ModelingPrepClient;
