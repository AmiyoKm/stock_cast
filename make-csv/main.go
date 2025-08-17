package main

import (
	"database/sql"
	"encoding/csv"
	"fmt"
	"os"
	"time"

	_ "github.com/lib/pq"
)

type StockRow struct {
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

func main() {
	db, err := sql.Open("postgres", "user=stock_cast password=password dbname=stock_cast sslmode=disable")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	rows, err := db.Query(`SELECT date, trading_code, ltp, high, low, openp, closep, ycp, trade, value, volume FROM stock_history ORDER BY date, trading_code`)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	file, err := os.Create("stock_history.csv")
	if err != nil {
		panic(err)
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	// Write header
	writer.Write([]string{
		"date", "trading_code", "ltp", "high", "low", "openp", "closep", "ycp", "trade", "value", "volume",
	})

	count := 0
	for rows.Next() {
		var row StockRow
		err := rows.Scan(
			&row.Date,
			&row.TradingCode,
			&row.Ltp,
			&row.High,
			&row.Low,
			&row.Openp,
			&row.Closep,
			&row.Ycp,
			&row.Trade,
			&row.Value,
			&row.Volume,
		)
		if err != nil {
			fmt.Println("Row scan error:", err)
			continue
		}
		writer.Write([]string{
			row.Date.Format("2006-01-02"),
			row.TradingCode,
			fmt.Sprintf("%f", row.Ltp),
			fmt.Sprintf("%f", row.High),
			fmt.Sprintf("%f", row.Low),
			fmt.Sprintf("%f", row.Openp),
			fmt.Sprintf("%f", row.Closep),
			fmt.Sprintf("%f", row.Ycp),
			fmt.Sprintf("%d", row.Trade),
			fmt.Sprintf("%f", row.Value),
			fmt.Sprintf("%d", row.Volume),
		})
		count++
	}
	fmt.Printf("Exported %d rows to stock_history.csv\n", count)
}
