CREATE INDEX IF NOT EXISTS idx_trading_code ON stock_history(trading_code);
CREATE INDEX IF NOT EXISTS idx_date ON stock_history(date);
