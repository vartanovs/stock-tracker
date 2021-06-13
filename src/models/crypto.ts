import dotenv from 'dotenv';
import { decamelizeKeys } from 'humps';

import CoinMarketCapClient from '../clients/coin_market_cap';
import CSVClient from '../clients/csv';
import { UPDATE_CRYPTO } from '../constants/flags';
import { CRYPTO_PRICES_HEADERS } from '../constants/headers';
import coinMarketCapUtils from '../utils/coin_market_cap';

import type { CryptoPrice, CryptoPricePayload } from '../types';

dotenv.config();

const coinMarketCapClient = new CoinMarketCapClient();

const { PATH_TO_CRYPTO_PRICES_CSV } = process.env;

const cryptoModel = {
  async getAll() {
    if (!UPDATE_CRYPTO) return [];
    const cryptoListings = await coinMarketCapClient.getCryptoListings();
    return coinMarketCapUtils.formatCryptoListings(cryptoListings);
  },

  saveAll(cryptoPrices: CryptoPrice[]) {
    if (!UPDATE_CRYPTO) return null;
    const cryptoPricePayload = (decamelizeKeys(cryptoPrices) as CryptoPricePayload[]).sort(cryptoModel.sortCryptoPrices);
    const stockPricesCsvClient = new CSVClient(PATH_TO_CRYPTO_PRICES_CSV as string, CRYPTO_PRICES_HEADERS as string[]);
    return stockPricesCsvClient.writeCSV(cryptoPricePayload);
  },

  sortCryptoPrices(cryptoA: CryptoPricePayload, cryptoB: CryptoPricePayload) {
    if (cryptoA.rank > cryptoB.rank) return 1;
    if (cryptoA.rank < cryptoB.rank) return -1;
    return 0;
  },
};

export default cryptoModel;
