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
	Users       UserRepo
	Tokens      TokenRepo
	Stocks      StockRepo
	Predictions PredictionRepo
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
