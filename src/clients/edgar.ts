import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { URL } from 'url';

import { FETCH_SLEEP_TIMEOUT_MS } from '../constants/configs';
import { EDGAR_FRAMES, QUARTERLY_EARNINGS_DATES } from '../constants/dates';
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
      .filter(({ frame }) => frame?.length)
      .map(({ frame, end }) => ({ frame, end }))
      .sort((date1, date2) => new Date(date2.end).getTime() - new Date(date1.end).getTime());

    const frames: { frame?: string, end: string }[] = EDGAR_FRAMES
      .map((frame, index) => {
        let date = dates.find((date) => date.frame === frame)
        if (date) return date;

        // Quarterly frame is sometimes missing - in this case, find an annual frame
        date = dates.find((date) => date.frame === frame.substring(0,6))
  
        return date ? date : { end: QUARTERLY_EARNINGS_DATES[index] };
      });

    // Latest quarter data may not yet be available
    while (!frames[0]?.frame! && frames.length) frames.shift()

    return frames.slice(0, 12);
  }

  private static getQuarterlyGrossProfit(frames: (string | undefined)[], frame?: string, revenueString?: string, costLabel?: EdgarLabel) {
    const quarterlyRevenueInMillions = Number(revenueString);
    if (!frame || !quarterlyRevenueInMillions || isNaN(quarterlyRevenueInMillions) || !costLabel) return '0';
    
    const { units: costUnits } = costLabel;
    const { USD = [] } = costUnits;

    // For quarterly frames - identify the cost frame and return the net of revenue and cost
    if (frame.length === 8) {
      const costValues = USD
        .filter((value) => value.frame === frame)
        .map(({ val }) => val);
      
      return String(costValues[0] ? quarterlyRevenueInMillions - Number(roundMillion(costValues[0])) : 0);
    }

    // For annual frames - remove prior three quarterly values from the annual value
    const annualFrameIndex = frames.indexOf(frame);
    const allCostFrames = frames
      .slice(annualFrameIndex, annualFrameIndex + 4)
      .map((frame) => USD.find((value) => value.frame === frame));
    const annualCost = allCostFrames.find((label) => label?.frame === frame)?.val;
    const quarterlyCosts = allCostFrames.filter((label) => label?.frame !== frame).map((label) => label?.val);
    
    const missingQuarterCost = annualCost ? quarterlyCosts.reduce((acc, val) => acc! - val!, annualCost) : 0;
    return String(missingQuarterCost ? quarterlyRevenueInMillions - Number(roundMillion(missingQuarterCost)) : 0);
  }

  private static getQuarterlyValue(frames: (string | undefined)[], frame?: string, label?: EdgarLabel) {
    if (!frame || !label) return '0';

    const { units } = label;
    const { USD = [] } = units;

    // For quarterly frames - identify the frame and return the value
    if (frame.length === 8) {
      const values = USD
        .filter((value) => value.frame === frame)
        .map(({ val }) => val);

      return roundMillion(values[0] ?? 0);
    }

    // For annual frames - remove prior three quarterly values from the annual value
    const annualFrameIndex = frames.indexOf(frame);
    const allFrames = frames
      .slice(annualFrameIndex, annualFrameIndex + 4)
      .map((frame) => USD.find((value) => value.frame === frame));

    const annualValue = allFrames.find((label) => label?.frame === frame)?.val;
    const quarterlyValues = allFrames.filter((label) => label?.frame !== frame)?.map((label) => label?.val);
    
    const missingQuarterValue = annualValue ? quarterlyValues.reduce((acc, val) => acc! - val!, annualValue) : 0;
    return roundMillion(missingQuarterValue ?? 0);
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
        CostOfGoodsAndServicesSold: GrossCostsAlt1,
        CostOfRevenue: GrossCostsAlt2,
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
        ...(GrossCostsAlt1 && GrossCostsAlt1.units && GrossCostsAlt1.units.USD ? GrossCostsAlt1.units.USD : []),
        ...(GrossCostsAlt2 && GrossCostsAlt2.units && GrossCostsAlt2.units.USD ? GrossCostsAlt2.units.USD : []),
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
      const frames = dates.map(({ frame }) => frame);

      const formattedIncomeStatements = dates
        .map(({ frame, end }) => ({ date: end, frame, symbol }))
        .map((data) => ({ ...data, revenue: EdgarClient.getQuarterlyValue(frames, data.frame, RevenuesAlt1) }))
        .map((data) => ({ ...data, revenue: data.revenue === '0' ? EdgarClient.getQuarterlyValue(frames, data.frame, RevenuesAlt2) : data.revenue }))
        .map((data) => ({ ...data, revenue: data.revenue === '0' ? EdgarClient.getQuarterlyValue(frames, data.frame, RevenuesAlt3) : data.revenue }))
        .map((data) => ({ ...data, revenue: data.revenue === '0' ? EdgarClient.getQuarterlyValue(frames, data.frame, RevenuesAlt4) : data.revenue }))
        .map((data) => ({ ...data, gross_profit: EdgarClient.getQuarterlyValue(frames, data.frame, GrossProfit) }))
        .map((data) => ({ ...data, gross_profit: data.gross_profit === '0' ? EdgarClient.getQuarterlyGrossProfit(frames, data.frame, data.revenue, GrossCostsAlt1) : data.gross_profit }))
        .map((data) => ({ ...data, gross_profit: data.gross_profit === '0' ? EdgarClient.getQuarterlyGrossProfit(frames, data.frame, data.revenue, GrossCostsAlt2) : data.gross_profit }))
        .map((data) => ({ ...data, net_income: EdgarClient.getQuarterlyValue(frames, data.frame, NetIncomeAlt1) }))
        .map((data) => ({ ...data, net_income: data.net_income === '0' ? EdgarClient.getQuarterlyValue(frames, data.frame, NetIncomeAlt2) : data.net_income }))
        .map((data) => ({ ...data, net_income: data.net_income === '0' ? EdgarClient.getQuarterlyValue(frames, data.frame, NetIncomeAlt3) : data.net_income }))
        .map((data) => ({ ...data, operating_income: EdgarClient.getQuarterlyValue(frames, data.frame, OperatingIncome) }))
        .map(({ frame, ...data }) => data);
      
      incomeStatements = [...incomeStatements, ...formattedIncomeStatements];
    }

    return incomeStatements;
  }
}

export default EdgarClient;
