package store

import (
	"context"
	"database/sql"
	"time"
)

type Stock struct {
	ID          int64
	Date        time.Time
	TradingCode string
	Ltp         float64
	High        float64
	Low         float64
	Openp       float64
	Closep      float64
	Ycp         float64
	Trade       int
	Value       float64
	Volume      int
}

type StockStore struct {
	db *sql.DB
}

func (s *StockStore) Get(ctx context.Context) ([]*Stock, error) {
	query := `SELECT id, date, trading_code, ltp, high, low, openp, closep, ycp, trade, value, volume
              FROM stock_history
              WHERE date = CURRENT_DATE
	`
	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stocks []*Stock
	for rows.Next() {
		var stock Stock
		err := rows.Scan(
			&stock.ID,
			&stock.Date,
			&stock.TradingCode,
			&stock.Ltp,
			&stock.High,
			&stock.Low,
			&stock.Openp,
			&stock.Closep,
			&stock.Ycp,
			&stock.Trade,
			&stock.Value,
			&stock.Volume,
		)
		if err != nil {
			return nil, err
		}
		stocks = append(stocks, &stock)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return stocks, nil
}

func (s *StockStore) GetByID(ctx context.Context, tradingCode string, start time.Time, end time.Time) ([]*Stock, error) {
	query := `SELECT id, date, trading_code, ltp, high, low, openp, closep, ycp, trade, value, volume
              FROM stock_history
              WHERE trading_code = $1 AND date >= $2 AND date <= $3
              ORDER BY date DESC`
	rows, err := s.db.QueryContext(ctx, query, tradingCode, start, end)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stocks []*Stock
	for rows.Next() {
		var stock Stock
		err := rows.Scan(
			&stock.ID,
			&stock.Date,
			&stock.TradingCode,
			&stock.Ltp,
			&stock.High,
			&stock.Low,
			&stock.Openp,
			&stock.Closep,
			&stock.Ycp,
			&stock.Trade,
			&stock.Value,
			&stock.Volume,
		)
		if err != nil {
			return nil, err
		}
		stocks = append(stocks, &stock)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return stocks, nil
}

func (s *StockStore) GetCurrentByID(ctx context.Context, tradingCode string) (*Stock, error) {
	query := `SELECT id, date, trading_code, ltp, high, low, openp, closep, ycp, trade, value, volume
              FROM stock_history
              WHERE trading_code = $1 AND date = CURRENT_DATE
            `
	stock := &Stock{}
	err := s.db.QueryRowContext(ctx, query, tradingCode).Scan(
		&stock.ID,
		&stock.Date,
		&stock.TradingCode,
		&stock.Ltp,
		&stock.High,
		&stock.Low,
		&stock.Openp,
		&stock.Closep,
		&stock.Ycp,
		&stock.Trade,
		&stock.Value,
		&stock.Volume,
	)
	if err != nil {
		return nil, err
	}
	return stock, nil
}
