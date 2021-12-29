import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { URL } from 'url';

import { FETCH_SLEEP_TIMEOUT_MS } from '../constants/configs';
import { roundMillion, sleep } from '../utils';

import type { Stock } from '../types';
import type { EdgarCompanyFactsResponse, EdgarLabel, EdgarIncomeStatementPayload, EdgarUnit } from '../types/edgar';

dotenv.config();

const userAgent = process.env.EDGAR_SEC_USER_AGENT!;

class EdgarClient {
  constructor(
    private endpoints: Record<string, string> = {},
    private host = 'https://data.sec.gov/'
  ) {
    this.endpoints.companyFacts = 'api/xbrl/companyfacts/';
  }

  private static getLatestQuarterEndDates(secUnits: EdgarUnit[]) {
    const dates =  secUnits
      .filter(({ frame }) => frame?.length === 8)
      .map(({ end }) => end);

    return dates
      .filter((value, index, array) => array.indexOf(value) === index)
      .sort((date1, date2) => new Date(date2).getTime() - new Date(date1).getTime())
      .slice(0, 8);
  }

  private static getQuarterlyValue(date: string, label?: EdgarLabel) {
    if (!label) return '0';

    const { units } = label;
    const { USD = [] } = units;
    const rawLabel = USD
      .filter((value) => value.frame?.length === 8 && value.end === date)
      .map(({ val }) => val);

    return roundMillion(rawLabel[0] ?? 0);
  }

  public async getIncomeStatements(equities: Stock[]) {
    let incomeStatements: EdgarIncomeStatementPayload[] = [];

    for (const { symbol, centralIndexKey } of equities) {
      const pathName = `${this.endpoints.companyFacts}CIK${centralIndexKey}.json`;
      const url = new URL(pathName, this.host);

      let apiResponse: EdgarCompanyFactsResponse;
      try {
        await sleep(FETCH_SLEEP_TIMEOUT_MS / 5); // eslint-disable-line
        console.log(`Fetching ${symbol} facts from: ${url}`); // eslint-disable-line
        const rawResponse = await fetch(url, { headers: { 'user-agent': userAgent } }); // eslint-disable-line
        apiResponse = await rawResponse.json(); // eslint-disable-line
      } catch (err) {
        try {
          await sleep(FETCH_SLEEP_TIMEOUT_MS); // eslint-disable-line
          console.warn('Fetch Error! Retrying...', err); // eslint-disable-line
          const response = await fetch(url); // eslint-disable-line
          apiResponse = await response.json(); // eslint-disable-line
        } catch (err2) {
          console.warn(`Unable to get company facts for ${symbol}`); // eslint-disable-line
          continue;
        }
      }

      const { facts } = apiResponse;
      const { 'us-gaap': usGAAP } = facts;
      if (!usGAAP) continue;

      // Some SEC entries use an alternative key for Revenue and Net Income
      const {
        GrossProfit,
        NetIncomeLoss: NetIncomeAlt1,
        NetIncomeLossAvailableToCommonStockholdersBasic: NetIncomeAlt2,
        ProfitLoss: NetIncomeAlt3,
        OperatingIncomeLoss: OperatingIncome,
        Revenues: RevenuesAlt1,
        RevenueFromContractWithCustomerExcludingAssessedTax: RevenuesAlt2,
        RevenueFromContractWithCustomerIncludingAssessedTax: RevenuesAlt3,
        OperatingLeaseLeaseIncome: RevenuesAlt4,
      } = usGAAP;

      const concatUSD = [
        ...(GrossProfit && GrossProfit.units && GrossProfit.units.USD ? GrossProfit.units.USD : []),
        ...(NetIncomeAlt1 && NetIncomeAlt1.units && NetIncomeAlt1.units.USD ? NetIncomeAlt1.units.USD : []),
        ...(NetIncomeAlt2 && NetIncomeAlt2.units && NetIncomeAlt2.units.USD ? NetIncomeAlt2.units.USD : []),
        ...(NetIncomeAlt3 && NetIncomeAlt3.units && NetIncomeAlt3.units.USD ? NetIncomeAlt3.units.USD : []),
        ...(OperatingIncome && OperatingIncome.units && OperatingIncome.units.USD ? OperatingIncome.units.USD : []),
        ...(RevenuesAlt1 && RevenuesAlt1.units && RevenuesAlt1.units.USD ? RevenuesAlt1.units.USD : []),
        ...(RevenuesAlt2 && RevenuesAlt2.units && RevenuesAlt2.units.USD ? RevenuesAlt2.units.USD : []),
        ...(RevenuesAlt3 && RevenuesAlt3.units && RevenuesAlt3.units.USD ? RevenuesAlt3.units.USD : []),
        ...(RevenuesAlt4 && RevenuesAlt4.units && RevenuesAlt4.units.USD ? RevenuesAlt4.units.USD : []),
      ];

      const dates = EdgarClient.getLatestQuarterEndDates(concatUSD);

      const formattedIncomeStatements = dates
        .map((date) => ({ date, symbol }))
        .map((data) => ({ ...data, gross_profit: EdgarClient.getQuarterlyValue(data.date, GrossProfit) }))
        .map((data) => ({ ...data, net_income: EdgarClient.getQuarterlyValue(data.date, NetIncomeAlt1) }))
        .map((data) => ({ ...data, net_income: data.net_income === '0' ? EdgarClient.getQuarterlyValue(data.date, NetIncomeAlt2) : data.net_income }))
        .map((data) => ({ ...data, net_income: data.net_income === '0' ? EdgarClient.getQuarterlyValue(data.date, NetIncomeAlt3) : data.net_income }))
        .map((data) => ({ ...data, operating_income: EdgarClient.getQuarterlyValue(data.date, OperatingIncome) }))
        .map((data) => ({ ...data, revenue: EdgarClient.getQuarterlyValue(data.date, RevenuesAlt1) }))
        .map((data) => ({ ...data, revenue: data.revenue === '0' ? EdgarClient.getQuarterlyValue(data.date, RevenuesAlt2) : data.revenue }))
        .map((data) => ({ ...data, revenue: data.revenue === '0' ? EdgarClient.getQuarterlyValue(data.date, RevenuesAlt3) : data.revenue }))
        .map((data) => ({ ...data, revenue: data.revenue === '0' ? EdgarClient.getQuarterlyValue(data.date, RevenuesAlt4) : data.revenue }));

      incomeStatements = [...incomeStatements, ...formattedIncomeStatements];
    }

    return incomeStatements;
  }
}

export default EdgarClient;
