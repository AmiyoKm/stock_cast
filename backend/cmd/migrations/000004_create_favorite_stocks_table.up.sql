CREATE TABLE IF NOT EXISTS favorite_stocks (
    user_id BIGINT NOT NULL,
    trading_code VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, trading_code),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
