package store

import (
	"context"
	"time"
)

type UserRepo interface {
	Get(ctx context.Context, userID int64) (*User, error)
	Create(ctx context.Context, user *User) error
	GetByEmail(ctx context.Context, email string) (*User, error)
	Update(ctx context.Context, user *User) error
	GetForToken(ctx context.Context, tokenScope, tokenPlainText string) (*User, error)
}

type TokenRepo interface {
	New(ctx context.Context, userID int64, ttl time.Duration, scope string) (*Token, error)
	DeleteAllForUser(ctx context.Context, scope string, userID int64) error
}

type StockRepo interface {
	Get(ctx context.Context) ([]*Stock, error)
	GetByID(ctx context.Context, tradingCode string, start time.Time, end time.Time) ([]*Stock, error)
	GetCurrentByID(ctx context.Context, tradingCode string) (*Stock, error)
}

type PredictionRepo interface {
	GetHistory(ctx context.Context, tradingCode string, start time.Time, end time.Time) ([]*Stock, error)
}
