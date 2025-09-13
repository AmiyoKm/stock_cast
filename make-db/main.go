package main

import (
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

type RawStockRow struct {
	Date        string `json:"DATE"`
	TradingCode string `json:"TRADING CODE"`
	Ltp         string `json:"LTP*"`
	High        string `json:"HIGH"`
	Low         string `json:"LOW"`
	Openp       string `json:"OPENP*"`
	Closep      string `json:"CLOSEP*"`
	Ycp         string `json:"YCP"`
	Trade       string `json:"TRADE"`
	Value       string `json:"VALUE (mn)"`
	Volume      string `json:"VOLUME"`
}

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

func convert(raw RawStockRow) (StockRow, error) {
	date, err := time.Parse("2006-01-02", raw.Date)
	if err != nil {
		return StockRow{}, fmt.Errorf("parsing date: %w", err)
	}

	// Helper to clean numeric strings by removing commas
	cleanNumeric := func(s string) string {
		return strings.ReplaceAll(s, ",", "")
	}

	ltp, err := strconv.ParseFloat(cleanNumeric(raw.Ltp), 64)
	if err != nil {
		return StockRow{}, fmt.Errorf("parsing ltp: %w", err)
	}

	high, err := strconv.ParseFloat(cleanNumeric(raw.High), 64)
	if err != nil {
		return StockRow{}, fmt.Errorf("parsing high: %w", err)
	}

	low, err := strconv.ParseFloat(cleanNumeric(raw.Low), 64)
	if err != nil {
		return StockRow{}, fmt.Errorf("parsing low: %w", err)
	}

	openp, err := strconv.ParseFloat(cleanNumeric(raw.Openp), 64)
	if err != nil {
		return StockRow{}, fmt.Errorf("parsing openp: %w", err)
	}

	closep, err := strconv.ParseFloat(cleanNumeric(raw.Closep), 64)
	if err != nil {
		return StockRow{}, fmt.Errorf("parsing closep: %w", err)
	}

	ycp, err := strconv.ParseFloat(cleanNumeric(raw.Ycp), 64)
	if err != nil {
		return StockRow{}, fmt.Errorf("parsing ycp: %w", err)
	}

	trade, err := strconv.Atoi(cleanNumeric(raw.Trade))
	if err != nil {
		return StockRow{}, fmt.Errorf("parsing trade: %w", err)
	}

	value, err := strconv.ParseFloat(cleanNumeric(raw.Value), 64)
	if err != nil {
		return StockRow{}, fmt.Errorf("parsing value: %w", err)
	}

	volume, err := strconv.Atoi(cleanNumeric(raw.Volume))
	if err != nil {
		return StockRow{}, fmt.Errorf("parsing volume: %w", err)
	}

	return StockRow{
		Date:        date,
		TradingCode: raw.TradingCode,
		Ltp:         ltp,
		High:        high,
		Low:         low,
		Openp:       openp,
		Closep:      closep,
		Ycp:         ycp,
		Trade:       trade,
		Value:       value,
		Volume:      volume,
	}, nil
}

//func main() {
// 	resp, err := http.Get("http://localhost:4000/v1/dse/historical?start=2025-08-25&end=2025-09-07")

// 	fmt.Println(resp.StatusCode, resp.Header)
// 	if err != nil {
// 		panic(err)
// 	}
// 	defer resp.Body.Close()

// 	var result struct {
// 		Data []RawStockRow `json:"data"`
// 	}
// 	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
// 		panic(err)
// 	}
// 	fmt.Println("Rows received:", len(result.Data))

// dbAddr := os.Getenv("DB_ADDR")
// if dbAddr == "" {
// 	dbAddr = "user=stock_cast password=password dbname=stock_cast sslmode=disable"
// }

// 	db, err := sql.Open("postgres", dbAddr)
// 	if err != nil {
// 		panic(err)
// 	}
// 	defer db.Close()

// 	stmt, err := db.Prepare(`INSERT INTO stock_history (date, trading_code, ltp, high, low, openp, closep, ycp, trade, value, volume)
//         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`)
// 	if err != nil {
// 		panic(err)
// 	}
// 	defer stmt.Close()

// 	for _, raw := range result.Data {
// 		row, err := convert(raw)
// 		if err != nil {
// 			fmt.Println("Skipping row due to error:", err)
// 			continue
// 		}
// 		_, err = stmt.Exec(row.Date, row.TradingCode, row.Ltp, row.High, row.Low, row.Openp, row.Closep, row.Ycp, row.Trade, row.Value, row.Volume)
// 		if err != nil {
// 			fmt.Println("DB insert error:", err)
// 		}
// 	}
// 	fmt.Println("Data import complete.")
// }

func main() {
	dbAddr := os.Getenv("DB_ADDR")
	if dbAddr == "" {
		dbAddr = "postgres://stock_cast:password@postgres:5432/stock_cast?sslmode=disable"
	}
	db, err := sql.Open("postgres", dbAddr)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	bdStockApiUrl := os.Getenv("BD_STOCK_API_URL")
	if bdStockApiUrl == "" {
		bdStockApiUrl = "http://localhost:4000"
	}

	stmt, err := db.Prepare(`INSERT INTO stock_history (date, trading_code, ltp, high, low, openp, closep, ycp, trade, value, volume)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`)
	if err != nil {
		panic(err)
	}
	defer stmt.Close()

	var year int
	flag.IntVar(&year, "year", 2023, "year to fetch data for")
	var startMonth int
	flag.IntVar(&startMonth, "startMonth", 1, "starting month (1-12)")
	var endMonth int
	flag.IntVar(&endMonth, "endMonth", 12, "ending month (1-12)")
	flag.Parse()

	// Validate flags
	if year < 2022 || year > time.Now().Year() {
		panic("Invalid year")
	}
	if startMonth < 1 || startMonth > 12 || endMonth < 1 || endMonth > 12 || startMonth > endMonth {
		panic("Invalid month range")
	}

	for m := startMonth; m <= endMonth; m++ {
		// Format start date with zero-padding (e.g., "2024-01-01")
		start := fmt.Sprintf("%d-%02d-01", year, m)

		// Calculate end date (last day of the month)
		endTime := time.Date(year, time.Month(m+1), 0, 0, 0, 0, 0, time.UTC)
		if m == 12 { // Handle December edge case
			endTime = time.Date(year, time.Month(12), 31, 0, 0, 0, 0, time.UTC)
		}
		end := endTime.Format("2006-01-02")

		url := fmt.Sprintf("%s/v1/dse/historical?start=%s&end=%s", bdStockApiUrl, start, end)
		fmt.Println("Fetching:", url)

		resp, err := http.Get(url)
		if err != nil {
			fmt.Println("HTTP error:", err)
			continue
		}

		var result struct {
			Data []RawStockRow `json:"data"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			resp.Body.Close()
			fmt.Println("JSON decode error:", err)
			continue
		}
		resp.Body.Close() // Close immediately after decoding

		fmt.Printf("Rows received for %d-%02d: %d\n", year, m, len(result.Data))

		for _, raw := range result.Data {
			row, err := convert(raw)
			if err != nil {
				fmt.Println("Skipping row due to error:", err)
				continue
			}
			_, err = stmt.Exec(row.Date, row.TradingCode, row.Ltp, row.High, row.Low, row.Openp, row.Closep, row.Ycp, row.Trade, row.Value, row.Volume)
			if err != nil {
				fmt.Println("DB insert error:", err)
			}
		}
		fmt.Printf("Month %d-%02d import complete.\n", year, m)
	}
	fmt.Println("All specified months import complete.")
}
