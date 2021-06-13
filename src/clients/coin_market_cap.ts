import dotenv from 'dotenv';
import fetch, { RequestInit } from 'node-fetch';

import { CRYPTO_COUNT } from '../constants/configs';

import type { CoinMarketCapResponse } from '../types/coin_market_cap';

dotenv.config();

const AUTH_HEADER = 'X-CMC_PRO_API_KEY';

class CoinMarketCapClient {
  constructor(
    private apiKey = process.env.COIN_MARKET_CAP_API_KEY as string,
    private endpoints: Record<string, string> = {},
    private host = 'https://pro-api.coinmarketcap.com/'
  ) {
    this.endpoints.listing = 'v1/cryptocurrency/listings/latest';
  }

  public async getCryptoListings() {
    const requestConfig: RequestInit = { headers: { [AUTH_HEADER]: this.apiKey } };
    const uri = `${this.host}${this.endpoints.listing}?limit=${CRYPTO_COUNT}`;

    let apiResponse: CoinMarketCapResponse;
    try {
      console.log(`Fetching crypto listings: ${uri}`); // eslint-disable-line
      const rawResponse = await fetch(uri, requestConfig);
      apiResponse = await rawResponse.json();
    } catch (err) {
      console.error(`Unable to get crypto listings`); // eslint-disable-line
      return [];
    }

    return apiResponse.data;
  }
}

export default CoinMarketCapClient;
