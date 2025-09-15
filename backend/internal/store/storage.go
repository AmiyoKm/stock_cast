package store

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

var (
	QueryTimeDuration    = time.Second * 30
	ErrorNotFound        = errors.New("resource not found")
	ErrDuplicateEmail    = errors.New("duplicate email")
	ErrDuplicateUsername = errors.New("duplicate username")
	ErrEditConflict      = errors.New("edit conflict")
)

type Storage struct {
	Stocks interface {
		Get(ctx context.Context) ([]*Stock, error)
		GetByID(ctx context.Context, tradingCode string, start time.Time, end time.Time) ([]*Stock, error)
		GetCurrentByID(ctx context.Context, tradingCode string) (*Stock, error)
	}
	Predictions interface {
		GetHistory(ctx context.Context, tradingCode string, start time.Time, end time.Time) ([]*Stock, error)
	}
	Users interface {
		Get(ctx context.Context, userID int64) (*User, error)
		Create(ctx context.Context, user *User) error
		GetByEmail(ctx context.Context, email string) (*User, error)
		Update(ctx context.Context, user *User) error
		GetForToken(ctx context.Context, tokenScope, tokenPlainText string) (*User, error)
	}
	Tokens interface {
		New(ctx context.Context, userID int64, ttl time.Duration, scope string) (*Token, error)
		DeleteAllForUser(ctx context.Context, scope string, userID int64) error
	}
}

func NewStorage(db *sql.DB) Storage {
	return Storage{
		Stocks:      &StockStore{db},
		Predictions: &predictionStore{db},
		Users:       &UserStore{db},
		Tokens:      &TokenStore{db},
	}
}

func withTx(db *sql.DB, ctx context.Context, fn func(*sql.Tx) error) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	if err := fn(tx); err != nil {
		_ = tx.Rollback()
		return err
	}
	return tx.Commit()
}
