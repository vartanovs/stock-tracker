import type { CryptoPrice } from '../types';
import type { CryptoData } from '../types/coin_market_cap';

const coinMarketCapUtils = {
  formatCryptoListings(cryptoListings: CryptoData[]): CryptoPrice[] {
    return cryptoListings
      .map((cryptoListing) => ({
        rank: cryptoListing.cmc_rank,
        symbol: cryptoListing.symbol,
        name: cryptoListing.name,
        price: cryptoListing.quote.USD.price,
        marketCap: cryptoListing.quote.USD.market_cap,
        lastDayChange: cryptoListing.quote.USD.percent_change_24h,
        lastWeekChange: cryptoListing.quote.USD.percent_change_7d,
        lastMonthChange: cryptoListing.quote.USD.percent_change_30d,
        twoMonthsChange: cryptoListing.quote.USD.percent_change_60d,
        threeMonthsChange: cryptoListing.quote.USD.percent_change_90d,
      }));
  },
};

export default coinMarketCapUtils;
