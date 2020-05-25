import dotenv from 'dotenv';

import CSVClient from '../clients/csv';
import { RECENT_FINANCIALS_HEADERS } from '../constants';

import type { RecentFinancialsPayload } from '../types';

dotenv.config();

const { PATH_TO_RECENT_FINANCIALS_CSV } = process.env;

const recentFinancialsModel = {
  async saveAll(recentFinancials: RecentFinancialsPayload[]) {
    const recentFinancialsCsvClient = new CSVClient(PATH_TO_RECENT_FINANCIALS_CSV as string, RECENT_FINANCIALS_HEADERS);
    await recentFinancialsCsvClient.writeCSV(recentFinancials);
  },
};

export default recentFinancialsModel;
