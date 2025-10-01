package store

import (
	"context"
	"database/sql"
	"time"
)

type Stock struct {
	ID          int64     `json:"id"`
	Date        time.Time `json:"date"`
	TradingCode string    `json:"tradingCode"`
	Ltp         float64   `json:"ltp"`
	High        float64   `json:"high"`
	Low         float64   `json:"low"`
	Openp       float64   `json:"openp"`
	Closep      float64   `json:"closep"`
	Ycp         float64   `json:"ycp"`
	Trade       int       `json:"trade"`
	Value       float64   `json:"value"`
	Volume      int       `json:"volume"`
}

type StockStore struct {
	db *sql.DB
}

func (s *StockStore) Get(ctx context.Context) ([]*Stock, error) {
	query := `SELECT id, date, trading_code, ltp, high, low, openp, closep, ycp, trade, value, volume
              FROM stock_history
              WHERE date = (SELECT MAX(date) FROM stock_history);
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

func (s *StockStore) GetFavoriteStocks(ctx context.Context, userID int64) ([]*Stock, error) {
	query := `
		SELECT DISTINCT ON (s.trading_code)
			s.id, s.date, s.trading_code, s.ltp, s.high, s.low, s.openp, s.closep, s.ycp, s.trade, s.value, s.volume
		FROM stock_history s
		JOIN favorite_stocks f ON s.trading_code = f.trading_code
		WHERE f.user_id = $1
		ORDER BY s.trading_code, s.date DESC;
	`

	rows, err := s.db.QueryContext(ctx, query, userID)
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

func (s *StockStore) CreateFavoriteStock(ctx context.Context, tradingCode string, userID int64) error {
	query := `
		INSERT INTO favorite_stocks(
		user_id,
		trading_code
	) VALUES(
		$1,
		$2
	);
	`

	err := s.db.QueryRowContext(ctx, query, userID, tradingCode).Err()
	if err != nil {
		return err
	}

	return nil
}

func (s *StockStore) RemoveFavoriteStock(ctx context.Context, tradingCode string, userID int64) error {
	query := `
		DELETE FROM favorite_stocks WHERE user_id = $1 AND trading_code = $2
	`

	_, err := s.db.ExecContext(ctx, query, userID, tradingCode)
	if err != nil {
		return err
	}

	return nil
}

func (s *StockStore) GetCurrentByID(ctx context.Context, tradingCode string) (*Stock, error) {
	query := `SELECT id, date, trading_code, ltp, high, low, openp, closep, ycp, trade, value, volume
              FROM stock_history
              WHERE trading_code = $1 AND date = (SELECT MAX(date) FROM stock_history)
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
