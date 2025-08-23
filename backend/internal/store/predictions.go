package store

import (
	"context"
	"database/sql"
	"time"
)

type predictionStore struct {
	db *sql.DB
}

func (s *predictionStore) GetHistory(ctx context.Context, tradingCode string, start time.Time, end time.Time) ([]*Stock, error) {
	query := `SELECT id, date, trading_code, ltp, high, low, openp, closep, ycp, trade, value, volume
              FROM stock_history
              WHERE trading_code = $1 AND date >= $2 AND date <= $3
              ORDER BY date ASC`
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
