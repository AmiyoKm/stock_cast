CREATE TABLE favorite_stocks (
    user_id UUID NOT NULL,
    trading_code VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, trading_code),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
