export interface EdgarCompanyFactsResponse {
  cik: number;
  entityName: string;
  facts: EdgarSECCompanyFacts;
}

export interface EdgarSECCompanyFacts {
  'dei': EdgarDocumentEntityInformation;
  'us-gaap': EdgarUSGAAP;
}

export interface EdgarDocumentEntityInformation {
  EntityCommonStockSharesOutstanding: EdgarLabel;
  EntityPublicFloat: EdgarLabel;
}

export interface EdgarUSGAAP {
  CostOfGoodsAndServicesSold?: EdgarLabel;
  CostOfRevenue?: EdgarLabel;
  GrossProfit?: EdgarLabel;
  NetIncomeLoss?: EdgarLabel;
  NetIncomeLossAvailableToCommonStockholdersBasic?: EdgarLabel;
  OperatingExpenses?: EdgarLabel;
  OperatingIncomeLoss?: EdgarLabel;
  OperatingLeaseLeaseIncome?: EdgarLabel;
  ProfitLoss?: EdgarLabel;
  ResearchAndDevelopmentExpense?: EdgarLabel;
  Revenues?: EdgarLabel;
  RevenueFromContractWithCustomerExcludingAssessedTax?: EdgarLabel;
  RevenueFromContractWithCustomerIncludingAssessedTax?: EdgarLabel;
  SellingGeneralAndAdministrativeExpense?: EdgarLabel;
}

export interface EdgarLabel {
  label: string;
  description: string;
  units: {
    shares?: EdgarUnit[];
    USD?: EdgarUnit[];
  };
}

export interface EdgarUnit {
  end: string;
  val: number;
  accn: string;
  fy: number;
  fp: string;
  form: string;
  filed: string;
  start?: string;
  frame?: string;
}

export interface EdgarIncomeStatementPayload {
  symbol: string;
  date: string;
  gross_profit: string;
  net_income: string;
  operating_income: string;
  revenue: string;
}
