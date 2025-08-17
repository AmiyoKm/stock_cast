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
)

type Storage struct {
	Stocks interface {
		Get(ctx context.Context) ([]*Stock, error)
		GetByID(ctx context.Context, tradingCode string, start time.Time, end time.Time) ([]*Stock, error)
		GetCurrentByID(ctx context.Context, tradingCode string) (*Stock,error)
	}
}

func NewStorage(db *sql.DB) Storage {
	return Storage{
		Stocks: &StockStore{db},
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
