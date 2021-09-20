import dotenv from 'dotenv';
import fetch from 'node-fetch';

import { FETCH_SLEEP_TIMEOUT_MS } from '../constants/configs';
import { sleep } from '../utils';

import type { Stock } from '../types';
import type { EquityProfile } from '../types/finnhub';

dotenv.config();

class FinnhubClient {
  constructor(
    private apiKey = process.env.FINNHUB_API_KEY as string,
    private endpoints: Record<string, string> = {},
    private headers: Record<string, string> = {},
    private host = 'https://finnhub.io/api/v1/'
  ) {
    this.endpoints.snapshots = 'stock/profile2';
    this.headers['X-Finnhub-Token'] = this.apiKey;
  }

  public async getEquityProfiles(equities: Stock[]) {
    const equitySymbols = equities.map(({ symbol }) => symbol);

    const equityProfiles: Record<string, { mktCap: number; shares: number }> = {};

    for (let i = 0; i < equitySymbols.length; i += 1) {
      const currentSymbol = equitySymbols[i];
      const uri = `${this.host}${this.endpoints.snapshots}?symbol=${currentSymbol}`;

      let apiResponse: Partial<EquityProfile> = {};
      try {
        await sleep(FETCH_SLEEP_TIMEOUT_MS * 25); // eslint-disable-line
        console.log(`Fetching equity profile from: ${uri}`); // eslint-disable-line
        const rawResponse = await fetch(uri, { headers: this.headers }); // eslint-disable-line
        apiResponse = await rawResponse.json(); // eslint-disable-line
      } catch (err) {
        try {
          await sleep(FETCH_SLEEP_TIMEOUT_MS); // eslint-disable-line
          console.warn('Fetch Error! Retrying', err); // eslint-disable-line
          const response = await fetch(uri, { headers: this.headers }); // eslint-disable-line
          apiResponse = await response.json(); // eslint-disable-line
        } catch (err2) {
          console.warn(`Unable to get profile information for $${currentSymbol}`); // eslint-disable-line
        }
      }

      const { marketCapitalization: mktCap, shareOutstanding: shares } = apiResponse as EquityProfile;
      equityProfiles[currentSymbol] = { mktCap, shares };
    }

    return equityProfiles;
  }
}

export default FinnhubClient;
