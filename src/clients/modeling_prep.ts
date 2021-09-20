import dotenv from 'dotenv';
import fetch from 'node-fetch';

import { FETCH_SLEEP_TIMEOUT_MS, MODELING_PREP_CURRENT_PRICES_CHUNK_SIZE, MODELING_PREP_HISTORIC_PRICES_CHUNK_SIZE, MODELING_PREP_INCOME_STATEMENT_CHUNK_SIZE } from '../constants/configs';
import { FINANCIAL_STATEMENTS_START_YEAR, HISTORIC_PRICES_FROM_DATE } from '../constants/dates';

import { chunkList, sleep, roundMillion, roundRatio } from '../utils';
import { formatModelingPrepHistoricStockPrices, formatModelingPrepIncomeStatement } from '../utils/modeling_prep';

import type { ExtendedIncomeStatementPayload, Stock, StockPricePayload, CurrentStockProfile } from '../types';
import {
  ModelingPrepIncomeStatements,
  ModelingPrepFinancialsResponse,
  ModelingPrepHistoricPriceResponse,
  ModelingPrepHistoricPrices,
  ModelingPrepProfile,
  ModelingPrepQuote,
} from '../types/modeling_prep';

dotenv.config();

class ModelingPrepClient {
  constructor(
    private apiKey = process.env.FINANCIAL_MODELING_PREP_API_KEY as string,
    private endpoints: Record<string, string> = {},
    private host = 'https://financialmodelingprep.com/api/v3/'
  ) {
    this.endpoints.historicPrice = 'historical-price-full/';
    this.endpoints.incomeStatement =  'financials/income-statement/';
    this.endpoints.profile = 'profile/';
    this.endpoints.quote = 'quote/';
  }

  // Given a raw API responses, return formatted current stock price data
  private static formatCurrentStockPrices(modelingPrepProfiles: ModelingPrepProfile[], equities: Stock[]): CurrentStockProfile[] {
    return modelingPrepProfiles
      .map(({ symbol, price, industry: unformattedIndustry, sector, mktCap, lastDiv }) => {
        const shares = Number(roundMillion(String(mktCap / price)));
        const roundedMktCap = Number(roundMillion(String(mktCap)));
        const roundedLastDiv = Number(roundRatio(String(lastDiv)));
        const { exchangeType, name } = equities.find((equity) => equity.symbol === symbol) as Stock;
        const industry = unformattedIndustry.replace(',', '');
        return { exchangeType, symbol, name, price, industry, sector, shares, mktCap: roundedMktCap, lastDiv: roundedLastDiv };
      });
  }

  // Given a raw API response, return quarterly formatted historic stock prices
  private static formatHistoricStockPrices(historicalStockList: ModelingPrepHistoricPrices[], stocks: Stock[]) {
    let historicStockPrices: StockPricePayload[] = [];

    historicalStockList
      .map(formatModelingPrepHistoricStockPrices)
      .map((historicStockPrices) => historicStockPrices
        .map((historicStockPrice) => ({
          ...historicStockPrice,
          exchange_type: stocks.find(({ symbol }) => symbol === historicStockPrice.symbol)!.exchangeType,
        })))
      .forEach((formattedStockPricePayloads) => {
        historicStockPrices = [...historicStockPrices, ...formattedStockPricePayloads];
      });

    return historicStockPrices;
  }

  // Given a raw API response, return formatted income statements since START_YEAR
  private static formatRecentIncomeStatements(financialStatementList: ModelingPrepIncomeStatements[]) {
    let incomeStatements: ExtendedIncomeStatementPayload[] = [];

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
    let incomeStatements: ExtendedIncomeStatementPayload[] = [];

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
      let formattedIncomeStatements: ExtendedIncomeStatementPayload[] = [];
      if (Array.isArray(financialStatementList)) {
        formattedIncomeStatements = ModelingPrepClient.formatRecentIncomeStatements(financialStatementList);
      }

      incomeStatements = [...incomeStatements, ...formattedIncomeStatements];
    }

    return incomeStatements;
  }

  public async getEquityProfiles(equities: Stock[]) {
    const equitySymbols = equities.map(({ symbol }) => symbol);
    const equitySymbolChunks = chunkList(equitySymbols, MODELING_PREP_CURRENT_PRICES_CHUNK_SIZE);

    let currentStockPrices: CurrentStockProfile[] = [];
    for (let i = 0; i < equitySymbolChunks.length; i += 1) {
      const currentChunk = equitySymbolChunks[i];
      const uri = `${this.host}${this.endpoints.profile}${currentChunk.join(',')}?apikey=${this.apiKey}`;

      let apiResponse: ModelingPrepProfile[];
      try {
        await sleep(FETCH_SLEEP_TIMEOUT_MS); // eslint-disable-line
        console.log(`Fetching current prices from: ${uri}`); // eslint-disable-line
        const rawResponse = await fetch(uri); // eslint-disable-line
        apiResponse = await rawResponse.json() as ModelingPrepProfile[]; // eslint-disable-line
      } catch (err) {
        try {
          await sleep(FETCH_SLEEP_TIMEOUT_MS); // eslint-disable-line
          console.warn('Fetch Error! Retrying', err); // eslint-disable-line
          const response = await fetch(uri); // eslint-disable-line
          apiResponse = await response.json(); // eslint-disable-line
        } catch (err2) {
          console.warn(`Unable to get current prices for ${currentChunk}`); // eslint-disable-line
          return [];
        }
      }

      let formattedCurrentStockPrices: CurrentStockProfile[] = [];
      if (Array.isArray(apiResponse)) {
        formattedCurrentStockPrices = ModelingPrepClient.formatCurrentStockPrices(apiResponse, equities);
      }

      currentStockPrices = [...currentStockPrices, ...formattedCurrentStockPrices];
    }

    return currentStockPrices;
  }

  public async getIndexProfiles(indexes: Stock[]): Promise<CurrentStockProfile[]> {
    const indexSymbols = indexes.map(({ symbol }) => symbol);

    let currentIndexPrices: CurrentStockProfile[] = [];
    for (let i = 0; i < indexSymbols.length; i += 1) {
      const currentIndex = indexSymbols[i];
      const uri = `${this.host}${this.endpoints.quote}${currentIndex}?apikey=${this.apiKey}`;

      let apiResponse: ModelingPrepQuote[];
      try {
        await sleep(FETCH_SLEEP_TIMEOUT_MS); // eslint-disable-line
        console.log(`Fetching current index prices from: ${uri}`); // eslint-disable-line
        const rawResponse = await fetch(uri); // eslint-disable-line
        apiResponse = await rawResponse.json() as ModelingPrepQuote[]; // eslint-disable-line
      } catch (err) {
        try {
          await sleep(FETCH_SLEEP_TIMEOUT_MS); // eslint-disable-line
          console.warn('Fetch Error! Retrying', err); // eslint-disable-line
          const response = await fetch(uri); // eslint-disable-line
          apiResponse = await response.json(); // eslint-disable-line
        } catch (err2) {
          console.warn('Unable to get current index prices'); // eslint-disable-line
          return [];
        }
      }

      const [industry, sector] = ['index', 'index'];
      const formattedResponse = apiResponse
        .map(({ symbol, price }) => {
          const indexMatchingSymbol = indexes.find((inx) => inx.symbol === symbol) ?? { exchangeType: 'index', symbol, name: 'index' };
          const { exchangeType, name } = indexMatchingSymbol;
          return { exchangeType, symbol, name, price, industry, sector, shares: 0, mktCap: 0 };
        });

      currentIndexPrices = [...currentIndexPrices, ...formattedResponse];
    }

    return currentIndexPrices;
  }

  public async getHistoricStockPrices(stocks: Stock[]) {
    const indexes = stocks.filter(({ exchangeType }) => exchangeType === 'index');

    let historicStockPrices: StockPricePayload[] = [];

    for (let i = 0; i < indexes.length; i += 1) {
      const { symbol: indexSymbol } = indexes[i];
      const uri = `${this.host}${this.endpoints.historicPrice}${indexSymbol}?from=${HISTORIC_PRICES_FROM_DATE}&apikey=${this.apiKey}`;

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

      const formattedHistoricalIndexPrices = formatModelingPrepHistoricStockPrices(apiResponse)
        .map((historicStockPrice) => ({ ...historicStockPrice, exchange_type: 'index' }));

      historicStockPrices = [...historicStockPrices, ...formattedHistoricalIndexPrices];
    }

    const equities = stocks
      .filter(({ exchangeType }) => exchangeType === 'nyse' || exchangeType === 'nasdaq')
      .map(({ symbol }) => symbol);

    const equitySymbolChunks = chunkList(equities, MODELING_PREP_HISTORIC_PRICES_CHUNK_SIZE); // API limits calls to 5 stock symbols at a time

    for (let i = 0; i < equitySymbolChunks.length; i += 1) {
      const currentChunk = equitySymbolChunks[i];
      const uri = `${this.host}${this.endpoints.historicPrice}${currentChunk.join(',')}?from=${HISTORIC_PRICES_FROM_DATE}&apikey=${this.apiKey}`;

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
          console.warn(`Unable to get historic prices for ${currentChunk}`); // eslint-disable-line
          return [];
        }
      }

      const { historicalStockList } = apiResponse;
      let formattedHistoricStockPrices: StockPricePayload[] = [];
      if (Array.isArray(historicalStockList)) {
        formattedHistoricStockPrices = ModelingPrepClient.formatHistoricStockPrices(historicalStockList, stocks);
      }

      historicStockPrices = [...historicStockPrices, ...formattedHistoricStockPrices];
    }

    return historicStockPrices;
  }
}

export default ModelingPrepClient;
