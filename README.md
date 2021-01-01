# stock-tracker

Utility to pull financial information for a collection of equities

## Config Values

- `NEW_STOCKS` - To only seed incremental stocks, indicate new stocks to seed by ticker

## Feature Flags

- `UPDATE_INCOME_STATEMENTS` - Update `income_statements` table with API data
- `UPDATE_HISTORIC_STOCK_PRICES` - Update `stock_prices` table with historic API data
- `UPDATE_STOCK_LIST` - Update `stocks` table with stock-list CSV
- `UPDATE_STOCK_PRICES` - Update `stock_prices` table with current API data
- `UPSERT_INCOME_STATEMENTS` - Update `income_statements` table with income statement corrections CSV
