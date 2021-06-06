import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { URL } from 'url';

import { FETCH_SLEEP_TIMEOUT_MS } from '../constants/configs';
import { QUARTERLY_EARNINGS_DATES } from '../constants/dates';
import { roundMillion, sleep } from '../utils';

import type { EdgarCoreFinancialsResponse, EdgarIncomeStatementConsolidated, EdgarIncomeStatementPayload, EdgarIncomeStatementValue } from '../types/edgar';

dotenv.config();

class EdgarClient {
  constructor(
    private apiKey = process.env.EDGAR_API_KEY as string,
    private endpoints: Record<string, string> = {},
    private host = 'https://datafied.api.edgar-online.com/v2/'
  ) {
    this.endpoints.coreFinancials = 'corefinancials/qtr';
  }

  private static formatIncomeStatements(incomeStatements: EdgarIncomeStatementConsolidated[], symbol: string) {
    return incomeStatements.map(({ rownum, values }) => ({
      symbol,
      date: QUARTERLY_EARNINGS_DATES[rownum],
      cost_of_revenue: EdgarClient.getRoundedValue(values, 'costofrevenue'),
      ebit: EdgarClient.getRoundedValue(values, 'ebit'),
      eps: values.find(({ field }) => field === 'basicepsnetincome')?.value ?? 0,
      eps_diluted: values.find(({ field }) => field === 'dilutedepsnetincome')?.value ?? 0,
      gross_profit: EdgarClient.getRoundedValue(values, 'grossprofit'),
      income_tax_expense: EdgarClient.getRoundedValue(values, 'incometaxes'),
      net_income: EdgarClient.getRoundedValue(values, 'netincome'),
      net_income_com: EdgarClient.getRoundedValue(values, 'netincomeapplicabletocommon'),
      operating_income: EdgarClient.getRoundedValue(values, 'operatingprofit'),
      rd_expense: EdgarClient.getRoundedValue(values, 'researchdevelopmentexpense'),
      revenue: EdgarClient.getRoundedValue(values, 'totalrevenue'),
      sga_expense: EdgarClient.getRoundedValue(values, 'sellinggeneraladministrativeexpenses'),
    }) as EdgarIncomeStatementPayload);
  }

  private static getRoundedValue(incomeStatementValues: EdgarIncomeStatementValue[], keyName: string) {
    return roundMillion(incomeStatementValues.find(({ field }) => field === keyName)?.value ?? 0);
  }

  public async getIncomeStatements(equities: string[]) {
    let incomeStatements: EdgarIncomeStatementPayload[] = [];

    for (let i = 0; i < equities.length; i += 1) {
      const currentSymbol = equities[i];
      const url = new URL(this.endpoints.coreFinancials, this.host);
      url.searchParams.set('Appkey', this.apiKey);
      url.searchParams.set('fields', 'IncomeStatementConsolidated');
      url.searchParams.set('primarysymbols', currentSymbol);
      url.searchParams.set('numPeriods', '8');
      url.searchParams.set('deleted', 'false');
      url.searchParams.set('debug', 'false');

      let apiResponse: EdgarCoreFinancialsResponse;
      try {
        await sleep(FETCH_SLEEP_TIMEOUT_MS/2); // eslint-disable-line
        console.log(`Fetching income statements from: ${url}`); // eslint-disable-line
        const rawResponse = await fetch(url, { headers: { 'Accept': 'application/json' } }); // eslint-disable-line
        apiResponse = await rawResponse.json() as EdgarCoreFinancialsResponse; // eslint-disable-line
      } catch (err) {
        try {
          await sleep(FETCH_SLEEP_TIMEOUT_MS); // eslint-disable-line
          console.warn('Fetch Error! Retrying...', err); // eslint-disable-line
          const response = await fetch(url); // eslint-disable-line
          apiResponse = await response.json(); // eslint-disable-line
        } catch (err2) {
          console.warn(`Unable to get financials for ${currentSymbol}`); // eslint-disable-line
          return [];
        }
      }

      const { result } = apiResponse;
      const { rows } = result;

      let formattedIncomeStatements: EdgarIncomeStatementPayload[] = [];
      if (Array.isArray(rows)) {
        formattedIncomeStatements = EdgarClient.formatIncomeStatements(rows, currentSymbol);
      }

      incomeStatements = [...incomeStatements, ...formattedIncomeStatements];
    }

    return incomeStatements;
  }
}

export default EdgarClient;
