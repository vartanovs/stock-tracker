import dotenv from 'dotenv';
import fetch from 'node-fetch';

import { FETCH_SLEEP_TIMEOUT_MS, ALPACA_SNAPSHOT_CHUNK_SIZE } from '../constants/configs';
import { chunkList, sleep } from '../utils';

import type { Stock } from '../types';
import type { Snapshot } from '../types/alpaca';

dotenv.config();

class AlpacaClient {
  constructor(
    private apiKey = process.env.ALPACA_API_KEY as string,
    private secret = process.env.ALPACA_SECRET_KEY as string,
    private endpoints: Record<string, string> = {},
    private headers: Record<string, string> = {},
    private host = 'https://data.alpaca.markets/v2/'
  ) {
    this.endpoints.snapshots = 'stocks/snapshots';
    this.headers['APCA-API-KEY-ID'] = this.apiKey;
    this.headers['APCA-API-SECRET-KEY'] = this.secret;
  }

  public async getCurrentEquityPrices(equities: Stock[]) {
    const equitySymbols = equities.map(({ symbol }) => symbol);

    const equitySymbolChunks = chunkList(equitySymbols, ALPACA_SNAPSHOT_CHUNK_SIZE);

    const currentEquityPrices: Record<string, number> = {};

    for (let i = 0; i < equitySymbolChunks.length; i += 1) {
      const currentChunk = equitySymbolChunks[i];
      const uri = `${this.host}${this.endpoints.snapshots}?symbols=${currentChunk.join(',')}`;

      let apiResponse: Record<string, Snapshot>;
      try {
        await sleep(FETCH_SLEEP_TIMEOUT_MS); // eslint-disable-line
        console.log(`Fetching current prices from: ${uri}`); // eslint-disable-line
        const rawResponse = await fetch(uri, { headers: this.headers }); // eslint-disable-line
        apiResponse = await rawResponse.json(); // eslint-disable-line
      } catch (err) {
        try {
          await sleep(FETCH_SLEEP_TIMEOUT_MS); // eslint-disable-line
          console.warn('Fetch Error! Retrying', err); // eslint-disable-line
          const response = await fetch(uri, { headers: this.headers }); // eslint-disable-line
          apiResponse = await response.json(); // eslint-disable-line
        } catch (err2) {
          console.warn(`Unable to get current prices for ${currentChunk}`); // eslint-disable-line
        }
      }

      currentChunk.forEach((ticker) => {
        const tickerSnapshot = apiResponse[ticker];
        if (tickerSnapshot) {
          currentEquityPrices[ticker] = AlpacaClient.getEquityPriceFromSnapshot(tickerSnapshot);
        } else {
          console.warn(`Unable to fetch Alpaca snapshot for $${ticker}`); // eslint-disable-line
        }
      });
    }

    return currentEquityPrices;
  }

  private static getEquityPriceFromSnapshot(snapshot: Snapshot) {
    // return the price of the most recent trade
    return snapshot.latestTrade.p;
  }
}

export default AlpacaClient;
