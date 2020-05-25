-- 3 records as of 2020/05/25
SELECT symbol, date, revenue, gross_profit, operating_income, net_income_com FROM income_statements
WHERE DATE >= '2020-04-01' AND DATE <= '2020-06-30';

-- 119 records
SELECT symbol, date, revenue, gross_profit, operating_income, net_income_com FROM income_statements
WHERE DATE >= '2020-01-01' AND DATE <= '2020-03-31';

-- 128 records
SELECT symbol, date, revenue, gross_profit, operating_income, net_income_com FROM income_statements
WHERE DATE >= '2019-10-01' AND DATE <= '2019-12-31';

-- 137 records
SELECT symbol, date, revenue, gross_profit, operating_income, net_income_com FROM income_statements
WHERE DATE >= '2019-07-01' AND DATE <= '2019-09-30';

-- 145 records
SELECT symbol, date, revenue, gross_profit, operating_income, net_income_com FROM income_statements
WHERE DATE >= '2019-04-01' AND DATE <= '2019-06-30';

-- 145 records
SELECT symbol, date, revenue, gross_profit, operating_income, net_income_com FROM income_statements
WHERE DATE >= '2019-01-01' AND DATE <= '2019-03-31';

-- 148 records
SELECT symbol, date, revenue, gross_profit, operating_income, net_income_com FROM income_statements
WHERE DATE >= '2018-10-01' AND DATE <= '2018-12-31';

-- 155 records
SELECT symbol, date, revenue, gross_profit, operating_income, net_income_com FROM income_statements
WHERE DATE >= '2018-07-01' AND DATE <= '2018-09-30';

-- 145 records
SELECT symbol, date, revenue, gross_profit, operating_income, net_income_com FROM income_statements
WHERE DATE >= '2018-04-01' AND DATE <= '2018-06-30';

-- 131 records
SELECT symbol, date, revenue, gross_profit, operating_income, net_income_com FROM income_statements
WHERE DATE >= '2018-01-01' AND DATE <= '2018-03-31';
