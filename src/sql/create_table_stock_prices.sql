CREATE TABLE stock_prices (
    exchange_type VARCHAR(6),
    symbol VARCHAR(6),
    date DATE,
    high DOUBLE PRECISION,
    low DOUBLE PRECISION,
    PRIMARY KEY(symbol, date)
);
