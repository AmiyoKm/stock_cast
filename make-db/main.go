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

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func main() {
	dbUser := getEnv("PGUSER", "stock_cast")
	dbPassword := getEnv("PGPASSWORD", "password")
	dbName := getEnv("PGDATABASE", "stock_cast")

	dbHost := getEnv("PGHOST", "localhost")
	port := getEnv("PGPORT", "5432")

	sslMode := getEnv("PGSSLMODE", "disable")
	channelBinding := getEnv("PGCHANNELBINDING", "disable")

	dbAddr := fmt.Sprintf("user=%s password=%s host=%s port=%s dbname=%s sslmode=%s channel_binding=%s", dbUser, dbPassword, dbHost, port, dbName, sslMode, channelBinding)

	db, err := sql.Open("postgres", dbAddr)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	bdStockApiUrl := os.Getenv("BD_STOCK_API_URL")
	if bdStockApiUrl == "" {
		bdStockApiUrl = "http://localhost:4000"
	}

	var start string
	var end string
	flag.StringVar(&start, "start", time.Now().Format("2006-01-02"), "Start date in YYYY-MM-DD format")
	flag.StringVar(&end, "end", time.Now().Format("2006-01-02"), "End date in YYYY-MM-DD format")
	flag.Parse()
	fmt.Println("Fetching data from", bdStockApiUrl, "for date range", start, "to", end)

	resp, err := http.Get(fmt.Sprintf("%s/v1/dse/historical?start=%s&end=%s", bdStockApiUrl, start, end))

	fmt.Println(resp.StatusCode, resp.Header)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	var result struct {
		Data []RawStockRow `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		panic(err)
	}
	fmt.Println("Rows received:", len(result.Data))

	defer db.Close()

	stmt, err := db.Prepare(`INSERT INTO stock_history (date, trading_code, ltp, high, low, openp, closep, ycp, trade, value, volume)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`)
	if err != nil {
		panic(err)
	}
	defer stmt.Close()

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
	fmt.Println("Data import complete.")
}
