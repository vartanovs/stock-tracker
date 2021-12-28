CREATE TABLE stocks (
    symbol VARCHAR(6) PRIMARY KEY,
    exchange_type VARCHAR(6),
    name VARCHAR(64),
    central_index_key VARCHAR(10),
    sector VARCHAR(64),
    industry VARCHAR(64)
);
