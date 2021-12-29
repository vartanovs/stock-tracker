
export interface EdgarCoreFinancialsResponse {
  result: {
    totalRows: number;
    rows: EdgarIncomeStatementConsolidated[];
  };
}

export interface EdgarIncomeStatementConsolidated {
  rownum: number;
  values: EdgarIncomeStatementValue[];
}

export type EdgarIncomeStatementKeys = 'basicepsnetincome' // eps
| 'costofrevenue' // cost_of_revenue
| 'dilutedepsnetincome' // eps_diluted
| 'ebit' // ebit
| 'grossprofit' // gross_profit
| 'incometaxes' // income_tax_expense
| 'netincome' // net_income
| 'netincomeapplicabletocommon' // net_income_com
| 'operatingprofit' // operating_income
| 'researchdevelopmentexpense' // rd_expense
| 'sellinggeneraladministrativeexpenses' // sga_expense
| 'totalrevenue'; // revenue

// Subset of ExtendedIncomeStatementPayload
export interface EdgarIncomeStatementPayload {
  symbol: string;
  date: string;
  cost_of_revenue: string;
  ebit: string;
  eps: number;
  eps_diluted: number;
  gross_profit: string;
  income_tax_expense: string;
  net_income: string;
  net_income_com: string;
  operating_income: string;
  rd_expense: string;
  revenue: string;
  sga_expense: string;
}

export interface EdgarIncomeStatementValue {
  field: EdgarIncomeStatementKeys;
  value: number;
}
